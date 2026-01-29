import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { useCredits } from '@/lib/credits';
import { AI_CONFIG, calculateTTSCredits } from '@/lib/ai-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Voice sample texts for previews
const VOICE_SAMPLE_TEXT = {
  en: "Hello! This is a preview of how this voice sounds. I can read any text you provide with natural intonation and rhythm.",
  de: "Hallo! Dies ist eine Vorschau, wie diese Stimme klingt. Ich kann jeden Text mit natürlicher Betonung und Rhythmus vorlesen.",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, RATE_LIMITS.ai);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetIn: rateLimitResult.resetIn },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      text,
      voice = 'alloy',
      model = 'tts-1',
      speed = 1.0,
      responseFormat = 'mp3',
      estimateOnly = false,
      isPreview = false,
      previewLanguage = 'en',
    } = body;

    // Validate voice
    if (!AI_CONFIG.tts.voices.includes(voice)) {
      return NextResponse.json(
        { error: `Invalid voice. Supported: ${AI_CONFIG.tts.voices.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate model
    if (!AI_CONFIG.tts.models.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Supported: ${AI_CONFIG.tts.models.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate speed
    if (speed < AI_CONFIG.tts.speedRange.min || speed > AI_CONFIG.tts.speedRange.max) {
      return NextResponse.json(
        { error: `Speed must be between ${AI_CONFIG.tts.speedRange.min} and ${AI_CONFIG.tts.speedRange.max}` },
        { status: 400 }
      );
    }

    // Validate response format
    if (!AI_CONFIG.tts.outputFormats.includes(responseFormat)) {
      return NextResponse.json(
        { error: `Invalid format. Supported: ${AI_CONFIG.tts.outputFormats.join(', ')}` },
        { status: 400 }
      );
    }

    // For voice previews, use sample text and don't charge credits
    const textToSpeak = isPreview
      ? VOICE_SAMPLE_TEXT[previewLanguage as keyof typeof VOICE_SAMPLE_TEXT] || VOICE_SAMPLE_TEXT.en
      : text;

    if (!textToSpeak || textToSpeak.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (textToSpeak.length > AI_CONFIG.tts.maxCharacters) {
      return NextResponse.json(
        { error: `Text exceeds maximum length of ${AI_CONFIG.tts.maxCharacters} characters` },
        { status: 400 }
      );
    }

    // Calculate credits (free for previews)
    const characterCount = textToSpeak.length;
    const { totalCredits } = calculateTTSCredits(characterCount, model);
    const creditsRequired = isPreview ? 0 : totalCredits;

    // Estimate duration (rough: ~150 words per minute, ~5 chars per word)
    const wordsPerMinute = 150;
    const avgCharsPerWord = 5;
    const estimatedWords = characterCount / avgCharsPerWord;
    const estimatedDuration = Math.ceil((estimatedWords / wordsPerMinute) * 60); // in seconds

    // If only estimating, return the estimate
    if (estimateOnly) {
      return NextResponse.json({
        characterCount,
        totalCredits: creditsRequired,
        estimatedDuration,
        model,
        voice,
      });
    }

    // Check and deduct credits (skip for previews)
    if (!isPreview) {
      const result = await useCredits({
        userId: session.user.id,
        amount: creditsRequired,
        toolType: 'tts',
        description: `TTS: ${characterCount} chars, ${voice} voice, ${model}`,
        metadata: { characterCount, voice, model, speed },
      });

      if (!result.success) {
        return NextResponse.json(
          { error: 'Insufficient credits', required: creditsRequired },
          { status: 402 }
        );
      }
    }

    // Generate speech
    const response = await openai.audio.speech.create({
      model,
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: textToSpeak,
      speed,
      response_format: responseFormat as 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm',
    });

    // Get the audio as a buffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Convert to base64 for client
    const audioBase64 = audioBuffer.toString('base64');

    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      mp3: 'audio/mpeg',
      opus: 'audio/opus',
      aac: 'audio/aac',
      flac: 'audio/flac',
      wav: 'audio/wav',
      pcm: 'audio/pcm',
    };

    return NextResponse.json({
      audioData: audioBase64,
      mimeType: mimeTypes[responseFormat] || 'audio/mpeg',
      format: responseFormat,
      characterCount,
      creditsUsed: creditsRequired,
      estimatedDuration,
      voice,
      model,
      speed,
      isPreview,
    });
  } catch (error) {
    console.error('TTS generation error:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request. The text may contain unsupported content.' },
          { status: 400 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
