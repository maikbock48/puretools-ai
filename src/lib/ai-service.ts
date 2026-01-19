/**
 * AI Service Layer for PureTools
 * Handles Gemini 1.5 Pro and OpenAI Whisper API calls
 * with retry logic and error handling.
 */

// Configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const OPENAI_API_URL = 'https://api.openai.com/v1';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Types
export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface TranscriptionRequest {
  audioFile: File;
  language?: string;
}

export interface TranscriptionResponse {
  text: string;
  duration?: number;
  language?: string;
  summary?: string;
}

export interface AIServiceError {
  code: string;
  message: string;
  retryable: boolean;
}

// Utility: Delay function for retry logic
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility: Check if error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('timeout') ||
      message.includes('503') ||
      message.includes('429') ||
      message.includes('network')
    );
  }
  return false;
}

// Utility: Execute with retry
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!isRetryableError(error) || attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff
      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

/**
 * Gemini Translation Service
 * Translates text using Google's Gemini 1.5 Pro
 */
export async function translateWithGemini(
  request: TranslationRequest,
  apiKey: string
): Promise<TranslationResponse> {
  const { text, sourceLanguage, targetLanguage } = request;

  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}.
Maintain the original formatting, structure, and tone as closely as possible.
Only output the translated text, nothing else.

Text to translate:
${text}`;

  const response = await withRetry(async () => {
    const res = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${res.status} - ${errorData.error?.message || res.statusText}`
      );
    }

    return res.json();
  });

  const translatedText =
    response.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    translatedText,
    usage: response.usageMetadata
      ? {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
        }
      : undefined,
  };
}

/**
 * Translate PDF chunks
 * Handles large documents by splitting into manageable chunks
 */
export async function translatePDFChunks(
  chunks: string[],
  sourceLanguage: string,
  targetLanguage: string,
  apiKey: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const translatedChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const result = await translateWithGemini(
      {
        text: chunks[i],
        sourceLanguage,
        targetLanguage,
      },
      apiKey
    );

    translatedChunks.push(result.translatedText);

    if (onProgress) {
      onProgress(((i + 1) / chunks.length) * 100);
    }

    // Small delay between chunks to avoid rate limiting
    if (i < chunks.length - 1) {
      await delay(500);
    }
  }

  return translatedChunks;
}

/**
 * OpenAI Whisper Transcription Service
 * Transcribes audio/video files to text
 */
export async function transcribeWithWhisper(
  request: TranscriptionRequest,
  apiKey: string
): Promise<TranscriptionResponse> {
  const { audioFile, language } = request;

  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  if (language) {
    formData.append('language', language);
  }

  const response = await withRetry(async () => {
    const res = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `Whisper API error: ${res.status} - ${errorData.error?.message || res.statusText}`
      );
    }

    return res.json();
  });

  return {
    text: response.text,
    duration: response.duration,
    language: response.language,
  };
}

/**
 * Generate AI Summary using Gemini
 * Creates a summary of transcribed text
 */
export async function generateSummary(
  text: string,
  apiKey: string,
  language: string = 'English'
): Promise<string> {
  const prompt = `Please provide a concise summary of the following transcription in ${language}.
Include key points, main topics discussed, and any important conclusions or action items.

Transcription:
${text}

Summary:`;

  const response = await withRetry(async () => {
    const res = await fetch(
      `${GEMINI_API_URL}/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${res.status} - ${errorData.error?.message || res.statusText}`
      );
    }

    return res.json();
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Transcribe and Summarize
 * Complete pipeline for audio transcription with AI summary
 */
export async function transcribeAndSummarize(
  audioFile: File,
  openaiKey: string,
  geminiKey: string,
  language?: string,
  summaryLanguage: string = 'English'
): Promise<TranscriptionResponse> {
  // Step 1: Transcribe with Whisper
  const transcription = await transcribeWithWhisper(
    { audioFile, language },
    openaiKey
  );

  // Step 2: Generate summary with Gemini
  const summary = await generateSummary(
    transcription.text,
    geminiKey,
    summaryLanguage
  );

  return {
    ...transcription,
    summary,
  };
}

/**
 * Validate API Keys
 * Quick validation for API key formats
 */
export function validateApiKey(
  key: string,
  provider: 'gemini' | 'openai'
): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }

  if (provider === 'openai') {
    // OpenAI keys start with 'sk-' and are 51 characters
    return key.startsWith('sk-') && key.length >= 40;
  }

  if (provider === 'gemini') {
    // Gemini keys are typically 39 characters
    return key.length >= 30;
  }

  return false;
}

/**
 * Error Handler
 * Formats errors for consistent client-side handling
 */
export function formatAIError(error: unknown): AIServiceError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('429')) {
      return {
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded. Please try again in a moment.',
        retryable: true,
      };
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Invalid API key. Please check your credentials.',
        retryable: false,
      };
    }

    if (message.includes('quota') || message.includes('insufficient')) {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'API quota exceeded. Please check your plan limits.',
        retryable: false,
      };
    }

    return {
      code: 'API_ERROR',
      message: error.message,
      retryable: isRetryableError(error),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
    retryable: false,
  };
}
