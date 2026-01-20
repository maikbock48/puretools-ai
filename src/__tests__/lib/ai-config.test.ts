import { describe, it, expect } from 'vitest';
import {
  AI_CONFIG,
  CREDIT_PRICING,
  calculateCredits,
  SUPPORTED_LANGUAGES,
  SUPPORTED_FILE_TYPES,
} from '@/lib/ai-config';

describe('AI Configuration', () => {
  describe('AI_CONFIG', () => {
    it('has Gemini configuration', () => {
      expect(AI_CONFIG.gemini).toBeDefined();
      expect(AI_CONFIG.gemini.model).toBe('gemini-1.5-flash');
      expect(AI_CONFIG.gemini.maxTokens).toBe(8192);
    });

    it('has Whisper configuration', () => {
      expect(AI_CONFIG.whisper).toBeDefined();
      expect(AI_CONFIG.whisper.model).toBe('whisper-1');
      expect(AI_CONFIG.whisper.maxFileSizeMB).toBe(25);
    });
  });

  describe('CREDIT_PRICING', () => {
    it('has translate pricing', () => {
      expect(CREDIT_PRICING.translate).toBeDefined();
      expect(CREDIT_PRICING.translate.baseCredits).toBe(0.5);
      expect(CREDIT_PRICING.translate.minCredits).toBe(1);
    });

    it('has transcribe pricing', () => {
      expect(CREDIT_PRICING.transcribe).toBeDefined();
      expect(CREDIT_PRICING.transcribe.baseCredits).toBe(1);
      expect(CREDIT_PRICING.transcribe.minCredits).toBe(2);
    });

    it('has summarize pricing', () => {
      expect(CREDIT_PRICING.summarize).toBeDefined();
      expect(CREDIT_PRICING.summarize.baseCredits).toBe(0.3);
      expect(CREDIT_PRICING.summarize.minCredits).toBe(1);
    });

    it('has service fee percentage', () => {
      expect(CREDIT_PRICING.serviceFeePercent).toBe(10);
    });
  });

  describe('calculateCredits', () => {
    describe('translate', () => {
      it('returns minimum credits for small text', () => {
        const result = calculateCredits('translate', 100); // 100 words
        expect(result.baseCredits).toBe(1); // min credits
        expect(result.totalCredits).toBeGreaterThanOrEqual(1);
      });

      it('calculates credits for 1000 words', () => {
        const result = calculateCredits('translate', 1000);
        expect(result.baseCredits).toBe(1);
        expect(result.serviceFee).toBe(0.1);
        expect(result.totalCredits).toBe(2); // ceil(1 + 0.1)
      });

      it('calculates credits for 5000 words', () => {
        const result = calculateCredits('translate', 5000);
        expect(result.baseCredits).toBe(3); // ceil(5000/1000 * 0.5)
        expect(result.totalCredits).toBe(4); // ceil(3 + 0.3)
      });

      it('calculates credits for large text', () => {
        const result = calculateCredits('translate', 20000);
        expect(result.baseCredits).toBe(10); // ceil(20000/1000 * 0.5)
        expect(result.serviceFee).toBe(1);
        expect(result.totalCredits).toBe(11);
      });
    });

    describe('transcribe', () => {
      it('returns minimum credits for short audio', () => {
        const result = calculateCredits('transcribe', 30); // 30 seconds
        expect(result.baseCredits).toBe(2); // min credits
      });

      it('calculates credits for 1 minute', () => {
        const result = calculateCredits('transcribe', 60); // 60 seconds = 1 minute
        expect(result.baseCredits).toBe(2); // min is 2
      });

      it('calculates credits for 5 minutes', () => {
        const result = calculateCredits('transcribe', 300); // 300 seconds = 5 minutes
        expect(result.baseCredits).toBe(5);
        expect(result.serviceFee).toBe(0.5);
        expect(result.totalCredits).toBe(6);
      });

      it('calculates credits for long audio', () => {
        const result = calculateCredits('transcribe', 3600); // 1 hour
        expect(result.baseCredits).toBe(60);
        expect(result.totalCredits).toBe(66); // ceil(60 + 6)
      });
    });

    describe('summarize', () => {
      it('returns minimum credits for small text', () => {
        const result = calculateCredits('summarize', 500);
        expect(result.baseCredits).toBe(1); // min credits
      });

      it('calculates credits for 5000 words', () => {
        const result = calculateCredits('summarize', 5000);
        expect(result.baseCredits).toBe(2); // ceil(5000/1000 * 0.3)
      });

      it('calculates credits for 10000 words', () => {
        const result = calculateCredits('summarize', 10000);
        expect(result.baseCredits).toBe(3);
        expect(result.totalCredits).toBe(4);
      });
    });

    describe('service fee', () => {
      it('applies 10% service fee', () => {
        const result = calculateCredits('translate', 10000); // 5 base credits
        expect(result.baseCredits).toBe(5);
        expect(result.serviceFee).toBe(0.5);
      });

      it('rounds up total credits', () => {
        const result = calculateCredits('translate', 2000); // 1 base credit
        expect(result.totalCredits).toBe(2); // ceil(1 + 0.1)
      });
    });
  });

  describe('SUPPORTED_LANGUAGES', () => {
    describe('translate', () => {
      it('has at least 10 languages', () => {
        expect(SUPPORTED_LANGUAGES.translate.length).toBeGreaterThanOrEqual(10);
      });

      it('includes English', () => {
        const english = SUPPORTED_LANGUAGES.translate.find(l => l.code === 'en');
        expect(english).toBeDefined();
        expect(english?.name).toBe('English');
        expect(english?.nameDE).toBe('Englisch');
      });

      it('includes German', () => {
        const german = SUPPORTED_LANGUAGES.translate.find(l => l.code === 'de');
        expect(german).toBeDefined();
        expect(german?.name).toBe('German');
        expect(german?.nameDE).toBe('Deutsch');
      });

      it('all languages have required fields', () => {
        SUPPORTED_LANGUAGES.translate.forEach(lang => {
          expect(lang.code).toBeTruthy();
          expect(lang.name).toBeTruthy();
          expect(lang.nameDE).toBeTruthy();
        });
      });
    });

    describe('transcribe', () => {
      it('has auto-detect option', () => {
        const auto = SUPPORTED_LANGUAGES.transcribe.find(l => l.code === 'auto');
        expect(auto).toBeDefined();
        expect(auto?.name).toBe('Auto-detect');
      });

      it('has at least 5 languages', () => {
        expect(SUPPORTED_LANGUAGES.transcribe.length).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('SUPPORTED_FILE_TYPES', () => {
    describe('translate', () => {
      it('accepts text files', () => {
        expect(SUPPORTED_FILE_TYPES.translate.accept).toContain('.txt');
        expect(SUPPORTED_FILE_TYPES.translate.mimeTypes).toContain('text/plain');
      });

      it('accepts markdown files', () => {
        expect(SUPPORTED_FILE_TYPES.translate.accept).toContain('.md');
        expect(SUPPORTED_FILE_TYPES.translate.mimeTypes).toContain('text/markdown');
      });

      it('accepts DOCX files', () => {
        expect(SUPPORTED_FILE_TYPES.translate.accept).toContain('.docx');
      });

      it('accepts PDF files', () => {
        expect(SUPPORTED_FILE_TYPES.translate.accept).toContain('.pdf');
        expect(SUPPORTED_FILE_TYPES.translate.mimeTypes).toContain('application/pdf');
      });

      it('has 10MB max size', () => {
        expect(SUPPORTED_FILE_TYPES.translate.maxSizeMB).toBe(10);
      });
    });

    describe('transcribe', () => {
      it('accepts MP3 files', () => {
        expect(SUPPORTED_FILE_TYPES.transcribe.accept).toContain('.mp3');
        expect(SUPPORTED_FILE_TYPES.transcribe.mimeTypes).toContain('audio/mpeg');
      });

      it('accepts WAV files', () => {
        expect(SUPPORTED_FILE_TYPES.transcribe.accept).toContain('.wav');
        expect(SUPPORTED_FILE_TYPES.transcribe.mimeTypes).toContain('audio/wav');
      });

      it('accepts video files for audio extraction', () => {
        expect(SUPPORTED_FILE_TYPES.transcribe.accept).toContain('.mp4');
        expect(SUPPORTED_FILE_TYPES.transcribe.mimeTypes).toContain('video/mp4');
      });

      it('has 25MB max size', () => {
        expect(SUPPORTED_FILE_TYPES.transcribe.maxSizeMB).toBe(25);
      });
    });

    describe('summarize', () => {
      it('accepts same file types as translate', () => {
        expect(SUPPORTED_FILE_TYPES.summarize.accept).toBe(SUPPORTED_FILE_TYPES.translate.accept);
      });

      it('has 10MB max size', () => {
        expect(SUPPORTED_FILE_TYPES.summarize.maxSizeMB).toBe(10);
      });
    });
  });
});
