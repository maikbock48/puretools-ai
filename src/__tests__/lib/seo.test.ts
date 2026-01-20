import { describe, it, expect, vi } from 'vitest';
import {
  toolConfigs,
  generateToolMetadata,
  getCanonicalUrl,
  getStructuredData,
  ToolKey,
} from '@/lib/seo';

describe('SEO Module', () => {
  describe('toolConfigs', () => {
    it('has all required tools configured', () => {
      const requiredTools: ToolKey[] = [
        'qrGenerator',
        'imageCompressor',
        'heicConverter',
        'pdfToolkit',
        'pdfToJpg',
        'videoTrimmer',
        'wifiQr',
        'ocr',
        'audioCutter',
        'audioConverter',
        'socialCropper',
        'bacCalculator',
        'stickerMaker',
        'qrBusinessCard',
        'backgroundRemover',
        'jsonFormatter',
        'aiTranslator',
        'aiTranscriber',
      ];

      requiredTools.forEach(tool => {
        expect(toolConfigs[tool]).toBeDefined();
        expect(toolConfigs[tool].path).toBeTruthy();
        expect(toolConfigs[tool].variant).toMatch(/^(local|ai)$/);
      });
    });

    it('marks local tools correctly', () => {
      const localTools: ToolKey[] = [
        'qrGenerator',
        'imageCompressor',
        'heicConverter',
        'pdfToolkit',
      ];

      localTools.forEach(tool => {
        expect(toolConfigs[tool].variant).toBe('local');
      });
    });

    it('marks AI tools correctly', () => {
      expect(toolConfigs.aiTranslator.variant).toBe('ai');
      expect(toolConfigs.aiTranscriber.variant).toBe('ai');
    });

    it('all paths are URL-safe', () => {
      Object.values(toolConfigs).forEach(config => {
        expect(config.path).toMatch(/^[a-z0-9-]+$/);
      });
    });
  });

  describe('generateToolMetadata', () => {
    const mockTranslator = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'tools.qrGenerator.metaTitle': 'QR Code Generator - Create Custom QR Codes',
        'tools.qrGenerator.metaDescription': 'Free QR code generator with logo support',
        'tools.aiTranslator.metaTitle': 'AI Document Translator',
        'tools.aiTranslator.metaDescription': 'Translate documents with AI',
      };
      return translations[key] || key;
    });

    it('generates metadata for local tool', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'en');

      expect(metadata.title).toBe('QR Code Generator - Create Custom QR Codes');
      expect(metadata.description).toBe('Free QR code generator with logo support');
      expect(metadata.openGraph?.title).toBe('QR Code Generator - Create Custom QR Codes');
      expect(metadata.openGraph?.locale).toBe('en_US');
    });

    it('generates metadata for AI tool', () => {
      const metadata = generateToolMetadata('aiTranslator', mockTranslator, 'en');

      expect(metadata.title).toBe('AI Document Translator');
      expect(metadata.description).toBe('Translate documents with AI');
    });

    it('sets German locale for de language', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'de');

      expect(metadata.openGraph?.locale).toBe('de_DE');
    });

    it('includes correct URL in openGraph', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'en');

      expect(metadata.openGraph?.url).toBe('https://puretools.ai/en/tools/qr-generator');
    });

    it('includes correct URL for German version', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'de');

      expect(metadata.openGraph?.url).toBe('https://puretools.ai/de/tools/qr-generator');
    });

    it('includes alternates for both languages', () => {
      const metadata = generateToolMetadata('imageCompressor', mockTranslator, 'en');

      expect(metadata.alternates?.languages?.en).toBe('/en/tools/image-compressor');
      expect(metadata.alternates?.languages?.de).toBe('/de/tools/image-compressor');
    });

    it('includes keywords array', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'en');

      expect(metadata.keywords).toBeInstanceOf(Array);
      expect(metadata.keywords?.length).toBeGreaterThan(0);
    });

    it('includes twitter card metadata', () => {
      const metadata = generateToolMetadata('qrGenerator', mockTranslator, 'en');

      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.title).toBeTruthy();
      expect(metadata.twitter?.description).toBeTruthy();
    });
  });

  describe('getCanonicalUrl', () => {
    it('generates correct English canonical URL', () => {
      const url = getCanonicalUrl('en', '/tools/qr-generator');
      expect(url).toBe('https://puretools.ai/en/tools/qr-generator');
    });

    it('generates correct German canonical URL', () => {
      const url = getCanonicalUrl('de', '/tools/qr-generator');
      expect(url).toBe('https://puretools.ai/de/tools/qr-generator');
    });

    it('handles root path', () => {
      const url = getCanonicalUrl('en', '');
      expect(url).toBe('https://puretools.ai/en');
    });

    it('handles path with leading slash', () => {
      const url = getCanonicalUrl('en', '/pricing');
      expect(url).toBe('https://puretools.ai/en/pricing');
    });
  });

  describe('getStructuredData', () => {
    const mockTranslator = vi.fn((key: string) => {
      const translations: Record<string, string> = {
        'tools.qrGenerator.title': 'QR Generator',
        'tools.qrGenerator.metaDescription': 'Create custom QR codes',
        'tools.aiTranslator.title': 'AI Translator',
        'tools.aiTranslator.metaDescription': 'Translate with AI',
      };
      return translations[key] || key;
    });

    it('returns valid JSON-LD structure', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe('WebApplication');
    });

    it('includes tool name and description', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data.name).toBe('QR Generator');
      expect(data.description).toBe('Create custom QR codes');
    });

    it('marks local tools as free', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data.offers.price).toBe('0');
      expect(data.offers.priceCurrency).toBe('USD');
    });

    it('does not set price for AI tools', () => {
      const data = getStructuredData('aiTranslator', mockTranslator);

      expect(data.offers.price).toBeUndefined();
    });

    it('includes local features for local tools', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data.featureList).toContain('Privacy-first');
      expect(data.featureList).toContain('No data upload');
      expect(data.featureList).toContain('Works offline');
    });

    it('includes AI features for AI tools', () => {
      const data = getStructuredData('aiTranslator', mockTranslator);

      expect(data.featureList).toContain('AI-powered');
      expect(data.featureList).toContain('Cloud processing');
    });

    it('sets correct application category', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data.applicationCategory).toBe('UtilityApplication');
    });

    it('sets operating system to Any', () => {
      const data = getStructuredData('qrGenerator', mockTranslator);

      expect(data.operatingSystem).toBe('Any');
    });
  });
});
