// AI Configuration and pricing constants

export const AI_CONFIG = {
  gemini: {
    model: 'gemini-1.5-flash',
    maxTokens: 8192,
  },
  whisper: {
    model: 'whisper-1',
    maxFileSizeMB: 25,
  },
  dalle: {
    model: 'dall-e-3',
    sizes: ['1024x1024', '1792x1024', '1024x1792'] as const,
    qualities: ['standard', 'hd'] as const,
    styles: ['vivid', 'natural'] as const,
  },
  sora: {
    model: 'sora', // Placeholder - API not yet public
    durations: [5, 10, 15, 20] as const,
    aspectRatios: ['16:9', '9:16', '1:1'] as const,
    styles: ['cinematic', 'animated', 'realistic'] as const,
  },
};

// Credit pricing (1 credit = $0.01 USD equivalent)
export const CREDIT_PRICING = {
  translate: {
    baseCredits: 0.5, // per 1000 words
    minCredits: 1,
  },
  transcribe: {
    baseCredits: 1, // per minute of audio
    minCredits: 2,
  },
  summarize: {
    baseCredits: 0.3, // per 1000 words
    minCredits: 1,
  },
  generateImage: {
    standard: 5, // 1024x1024 standard quality
    hd: 8, // 1024x1024 HD quality
    hdWide: 10, // 1792x1024 or 1024x1792 HD
  },
  generateVideo: {
    '5': 25, // 5 seconds
    '10': 40, // 10 seconds
    '15': 55, // 15 seconds
    '20': 70, // 20 seconds
  },
  serviceFeePercent: 10, // 10% service fee
};

// Calculate credits for image generation
export function calculateImageCredits(
  size: '1024x1024' | '1792x1024' | '1024x1792',
  quality: 'standard' | 'hd'
): number {
  if (quality === 'standard') {
    return CREDIT_PRICING.generateImage.standard;
  }
  if (size === '1024x1024') {
    return CREDIT_PRICING.generateImage.hd;
  }
  return CREDIT_PRICING.generateImage.hdWide;
}

// Calculate credits for video generation
export function calculateVideoCredits(duration: 5 | 10 | 15 | 20): number {
  return CREDIT_PRICING.generateVideo[String(duration) as keyof typeof CREDIT_PRICING.generateVideo];
}

export function calculateCredits(
  type: 'translate' | 'transcribe' | 'summarize',
  units: number // words for translate/summarize, seconds for transcribe
): { baseCredits: number; serviceFee: number; totalCredits: number } {
  const pricing = CREDIT_PRICING[type];
  let baseCredits: number;

  if (type === 'transcribe') {
    // units are seconds, convert to minutes
    const minutes = units / 60;
    baseCredits = Math.max(pricing.minCredits, Math.ceil(minutes * pricing.baseCredits));
  } else {
    // units are words, calculate per 1000 words
    const thousands = units / 1000;
    baseCredits = Math.max(pricing.minCredits, Math.ceil(thousands * pricing.baseCredits));
  }

  const serviceFee = baseCredits * (CREDIT_PRICING.serviceFeePercent / 100);
  const totalCredits = Math.ceil(baseCredits + serviceFee);

  return { baseCredits, serviceFee, totalCredits };
}

export const SUPPORTED_LANGUAGES = {
  translate: [
    { code: 'en', name: 'English', nameDE: 'Englisch' },
    { code: 'de', name: 'German', nameDE: 'Deutsch' },
    { code: 'fr', name: 'French', nameDE: 'Französisch' },
    { code: 'es', name: 'Spanish', nameDE: 'Spanisch' },
    { code: 'it', name: 'Italian', nameDE: 'Italienisch' },
    { code: 'pt', name: 'Portuguese', nameDE: 'Portugiesisch' },
    { code: 'nl', name: 'Dutch', nameDE: 'Niederländisch' },
    { code: 'pl', name: 'Polish', nameDE: 'Polnisch' },
    { code: 'ru', name: 'Russian', nameDE: 'Russisch' },
    { code: 'zh', name: 'Chinese', nameDE: 'Chinesisch' },
    { code: 'ja', name: 'Japanese', nameDE: 'Japanisch' },
    { code: 'ko', name: 'Korean', nameDE: 'Koreanisch' },
    { code: 'ar', name: 'Arabic', nameDE: 'Arabisch' },
    { code: 'hi', name: 'Hindi', nameDE: 'Hindi' },
    { code: 'tr', name: 'Turkish', nameDE: 'Türkisch' },
  ],
  transcribe: [
    { code: 'auto', name: 'Auto-detect', nameDE: 'Automatisch erkennen' },
    { code: 'en', name: 'English', nameDE: 'Englisch' },
    { code: 'de', name: 'German', nameDE: 'Deutsch' },
    { code: 'fr', name: 'French', nameDE: 'Französisch' },
    { code: 'es', name: 'Spanish', nameDE: 'Spanisch' },
    { code: 'it', name: 'Italian', nameDE: 'Italienisch' },
    { code: 'pt', name: 'Portuguese', nameDE: 'Portugiesisch' },
    { code: 'nl', name: 'Dutch', nameDE: 'Niederländisch' },
    { code: 'pl', name: 'Polish', nameDE: 'Polnisch' },
    { code: 'ru', name: 'Russian', nameDE: 'Russisch' },
    { code: 'zh', name: 'Chinese', nameDE: 'Chinesisch' },
    { code: 'ja', name: 'Japanese', nameDE: 'Japanisch' },
  ],
};

export const SUPPORTED_FILE_TYPES = {
  translate: {
    accept: '.txt,.md,.docx,.pdf',
    mimeTypes: [
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ],
    maxSizeMB: 10,
  },
  transcribe: {
    accept: '.mp3,.wav,.m4a,.webm,.mp4,.mpeg,.mpga,.ogg',
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/webm',
      'video/mp4',
      'audio/ogg',
    ],
    maxSizeMB: 25,
  },
  summarize: {
    accept: '.txt,.md,.docx,.pdf',
    mimeTypes: [
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ],
    maxSizeMB: 10,
  },
};
