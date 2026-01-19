import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateCredits } from '@/lib/ai-config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type SummaryLength = 'short' | 'medium' | 'long';
type SummaryStyle = 'bullet' | 'paragraph' | 'executive';

const SUMMARY_CONFIGS: Record<SummaryLength, { targetPercent: number; description: string }> = {
  short: { targetPercent: 10, description: '~10% of original length' },
  medium: { targetPercent: 25, description: '~25% of original length' },
  long: { targetPercent: 40, description: '~40% of original length' },
};

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
    const {
      text,
      length = 'medium',
      style = 'paragraph',
      language,
      estimateOnly,
    } = body as {
      text: string;
      length?: SummaryLength;
      style?: SummaryStyle;
      language?: string;
      estimateOnly?: boolean;
    };

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Text is too short to summarize' },
        { status: 400 }
      );
    }

    // Calculate word count and credits
    const wordCount = text.trim().split(/\s+/).length;
    const { baseCredits, serviceFee, totalCredits } = calculateCredits('summarize', wordCount);

    // If only estimating, return cost preview
    if (estimateOnly) {
      const config = SUMMARY_CONFIGS[length] || SUMMARY_CONFIGS.medium;
      return NextResponse.json({
        wordCount,
        baseCredits,
        serviceFee,
        totalCredits,
        estimatedOutputWords: Math.ceil(wordCount * (config.targetPercent / 100)),
        estimatedTime: Math.ceil(wordCount / 1000) * 3, // ~3 seconds per 1000 words
      });
    }

    // TODO: Check user credits here when auth is implemented

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const config = SUMMARY_CONFIGS[length] || SUMMARY_CONFIGS.medium;
    const targetWords = Math.ceil(wordCount * (config.targetPercent / 100));

    let styleInstructions = '';
    switch (style) {
      case 'bullet':
        styleInstructions = 'Format the summary as bullet points. Each point should capture a key idea or fact.';
        break;
      case 'executive':
        styleInstructions = 'Write an executive summary suitable for business contexts. Start with the main conclusion, then key findings, and end with recommendations if applicable.';
        break;
      case 'paragraph':
      default:
        styleInstructions = 'Write the summary as flowing paragraphs that read naturally.';
        break;
    }

    const languageInstruction = language
      ? `Write the summary in ${language}.`
      : 'Write the summary in the same language as the original text.';

    const prompt = `You are an expert summarizer. Create a ${length} summary of the following text.

Target length: approximately ${targetWords} words (${config.description})
${styleInstructions}
${languageInstruction}

Important instructions:
- Capture the main points and key information
- Maintain accuracy - do not add information not present in the original
- Preserve important numbers, names, and dates
- Do not add any meta-commentary like "This text discusses..." - just provide the summary

Text to summarize:
"""
${text}
"""

Summary:`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    const summaryWordCount = summary.trim().split(/\s+/).length;

    // TODO: Deduct credits from user when auth is implemented

    return NextResponse.json({
      summary,
      originalWordCount: wordCount,
      summaryWordCount,
      compressionRatio: Math.round((1 - summaryWordCount / wordCount) * 100),
      creditsUsed: totalCredits,
      style,
      length,
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Summarization failed. Please try again.' },
      { status: 500 }
    );
  }
}
