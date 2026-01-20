import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateCredits, AI_CONFIG } from '@/lib/ai-config';
import { auth } from '@/lib/auth';
import { hasEnoughCredits, useCredits } from '@/lib/credits';

// Lazy initialization to avoid build-time errors
function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string || 'auto';
    const estimateOnly = formData.get('estimateOnly') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Check file size
    const maxSize = AI_CONFIG.whisper.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${AI_CONFIG.whisper.maxFileSizeMB}MB limit` },
        { status: 400 }
      );
    }

    // Estimate audio duration from file size (rough estimate)
    // Average audio bitrate is around 128kbps = 16KB/s
    const estimatedDurationSeconds = Math.ceil(file.size / (16 * 1024));
    const { baseCredits, serviceFee, totalCredits } = calculateCredits('transcribe', estimatedDurationSeconds);

    // If only estimating, return cost preview
    if (estimateOnly) {
      return NextResponse.json({
        estimatedDuration: estimatedDurationSeconds,
        fileSize: file.size,
        baseCredits,
        serviceFee,
        totalCredits,
        estimatedTime: Math.ceil(estimatedDurationSeconds / 10), // ~10 seconds of audio per second processing
      });
    }

    // Check user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use AI features.' },
        { status: 401 }
      );
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(session.user.id, totalCredits);
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits to continue.' },
        { status: 402 }
      );
    }

    // Create transcription
    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: AI_CONFIG.whisper.model,
      language: language !== 'auto' ? language : undefined,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Deduct credits from user
    const actualDuration = transcription.duration || estimatedDurationSeconds;
    const creditResult = await useCredits({
      userId: session.user.id,
      amount: totalCredits,
      toolType: 'transcribe',
      description: `Transcription: ${Math.round(actualDuration)}s audio (${file.name})`,
      inputSize: file.size,
      outputSize: transcription.text.length,
      metadata: { language: transcription.language || language, duration: actualDuration },
    });

    if (!creditResult.success) {
      console.error('Credit deduction failed:', creditResult.error);
    }

    return NextResponse.json({
      text: transcription.text,
      duration: actualDuration,
      language: transcription.language || language,
      segments: transcription.segments || [],
      creditsUsed: totalCredits,
      newBalance: creditResult.newBalance,
    });
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 413) {
        return NextResponse.json(
          { error: 'Audio file is too large' },
          { status: 413 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 }
    );
  }
}
