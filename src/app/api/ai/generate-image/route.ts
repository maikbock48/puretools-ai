import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasEnoughCredits, useCredits } from '@/lib/credits';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { calculateImageCredits, AI_CONFIG } from '@/lib/ai-config';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check rate limit (5 images per minute)
    const rateLimitResult = checkRateLimit(request, RATE_LIMITS.ai);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before generating more images.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      estimateOnly = false,
    } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (prompt.length > 4000) {
      return NextResponse.json({ error: 'Prompt must be under 4000 characters' }, { status: 400 });
    }

    if (prompt.length < 10) {
      return NextResponse.json({ error: 'Prompt must be at least 10 characters' }, { status: 400 });
    }

    // Validate size
    if (!AI_CONFIG.dalle.sizes.includes(size as typeof AI_CONFIG.dalle.sizes[number])) {
      return NextResponse.json({ error: 'Invalid size' }, { status: 400 });
    }

    // Validate quality
    if (!AI_CONFIG.dalle.qualities.includes(quality as typeof AI_CONFIG.dalle.qualities[number])) {
      return NextResponse.json({ error: 'Invalid quality' }, { status: 400 });
    }

    // Validate style
    if (!AI_CONFIG.dalle.styles.includes(style as typeof AI_CONFIG.dalle.styles[number])) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    // Calculate credits
    const creditsRequired = calculateImageCredits(
      size as '1024x1024' | '1792x1024' | '1024x1792',
      quality as 'standard' | 'hd'
    );

    // If only estimating, return the cost
    if (estimateOnly) {
      const hasCredits = await hasEnoughCredits(session.user.id, creditsRequired);
      return NextResponse.json({
        creditsRequired,
        hasEnoughCredits: hasCredits,
        size,
        quality,
        style,
      });
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(session.user.id, creditsRequired);
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', creditsRequired },
        { status: 402 }
      );
    }

    // Generate image with DALL-E 3
    const openai = getOpenAI();

    const response = await openai.images.generate({
      model: AI_CONFIG.dalle.model,
      prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: quality as 'standard' | 'hd',
      style: style as 'vivid' | 'natural',
      response_format: 'url',
    });

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    // Deduct credits
    const result = await useCredits({
      userId: session.user.id,
      amount: creditsRequired,
      toolType: 'generateImage',
      description: `Image generation: ${prompt.substring(0, 50)}...`,
      metadata: {
        prompt: prompt.substring(0, 200),
        size,
        quality,
        style,
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl,
      revisedPrompt,
      creditsUsed: creditsRequired,
      newBalance: result.newBalance,
      size,
      quality,
      style,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Your prompt was rejected. Please try a different description.' },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Service is busy. Please try again in a moment.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}
