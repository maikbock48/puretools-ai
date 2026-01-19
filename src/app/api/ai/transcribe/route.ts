import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { calculateCredits, AI_CONFIG } from '@/lib/ai-config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // TODO: Check user credits here when auth is implemented

    // Create transcription
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: AI_CONFIG.whisper.model,
      language: language !== 'auto' ? language : undefined,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // TODO: Deduct credits from user when auth is implemented

    return NextResponse.json({
      text: transcription.text,
      duration: transcription.duration || estimatedDurationSeconds,
      language: transcription.language || language,
      segments: transcription.segments || [],
      creditsUsed: totalCredits,
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
