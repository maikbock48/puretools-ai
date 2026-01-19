import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUPPORTED_LANGUAGES, calculateCredits } from '@/lib/ai-config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { text, sourceLang, targetLang, estimateOnly } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Check if target language is supported
    const isValidTarget = SUPPORTED_LANGUAGES.translate.some(l => l.code === targetLang);
    if (!isValidTarget) {
      return NextResponse.json(
        { error: 'Unsupported target language' },
        { status: 400 }
      );
    }

    // Calculate word count and credits
    const wordCount = text.trim().split(/\s+/).length;
    const { baseCredits, serviceFee, totalCredits } = calculateCredits('translate', wordCount);

    // If only estimating, return cost preview
    if (estimateOnly) {
      return NextResponse.json({
        wordCount,
        baseCredits,
        serviceFee,
        totalCredits,
        estimatedTime: Math.ceil(wordCount / 500) * 2, // ~2 seconds per 500 words
      });
    }

    // TODO: Check user credits here when auth is implemented
    // For now, proceed with translation

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const sourceLanguage = sourceLang
      ? SUPPORTED_LANGUAGES.translate.find(l => l.code === sourceLang)?.name || 'auto-detected'
      : 'auto-detected';
    const targetLanguage = SUPPORTED_LANGUAGES.translate.find(l => l.code === targetLang)?.name || targetLang;

    const prompt = `You are a professional translator. Translate the following text ${sourceLang ? `from ${sourceLanguage}` : ''} to ${targetLanguage}.

Important instructions:
- Preserve the original formatting (paragraphs, line breaks, bullet points)
- Maintain the tone and style of the original text
- Do not add any explanations or notes, only provide the translation
- If there are proper nouns or technical terms, keep them as-is or provide the commonly used translation

Text to translate:
"""
${text}
"""

Translation:`;

    const result = await model.generateContent(prompt);
    const translation = result.response.text();

    // TODO: Deduct credits from user when auth is implemented

    return NextResponse.json({
      translation,
      wordCount,
      creditsUsed: totalCredits,
      sourceLang: sourceLang || 'auto',
      targetLang,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
