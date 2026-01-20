import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://puretools.ai';
  const languages = ['en', 'de'];
  const currentDate = new Date();

  // All tool slugs
  const tools = [
    'qr-generator',
    'heic-converter',
    'pdf-toolkit',
    'json-formatter',
    'audio-cutter',
    'background-remover',
    'code-beautifier',
    'csv-to-excel',
    'image-compressor',
    'ocr-scanner',
    'ai-translator',
    'ai-summarizer',
    'ai-transcriber',
  ];

  // Static pages
  const staticPages = ['', 'pricing', 'about', 'privacy', 'terms', 'impressum', 'contact'];

  const entries: MetadataRoute.Sitemap = [];

  // Add static pages for each language
  for (const lng of languages) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${lng}${page ? `/${page}` : ''}`,
        lastModified: currentDate,
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }

    // Add tool pages
    for (const tool of tools) {
      entries.push({
        url: `${baseUrl}/${lng}/tools/${tool}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  return entries;
}
