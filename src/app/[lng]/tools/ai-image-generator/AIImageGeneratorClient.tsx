'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Sparkles,
  Download,
  Loader2,
  Wand2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Palette,
  Zap,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';
import { useShareModal } from '@/components/ShareModal';

interface AIImageGeneratorClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'AI Image Generator',
    subtitle: 'Create stunning images from text descriptions using DALL-E 3',
    promptLabel: 'Describe your image',
    promptPlaceholder: 'A serene mountain landscape at sunset with a lake reflecting the orange sky, photorealistic style...',
    sizeLabel: 'Image Size',
    sizes: {
      '1024x1024': 'Square (1024×1024)',
      '1792x1024': 'Landscape (1792×1024)',
      '1024x1792': 'Portrait (1024×1792)',
    },
    qualityLabel: 'Quality',
    qualities: {
      standard: 'Standard',
      hd: 'HD',
    },
    styleLabel: 'Style',
    styles: {
      vivid: 'Vivid',
      natural: 'Natural',
    },
    generate: 'Generate Image',
    generating: 'Creating your image...',
    credits: 'Credits',
    signInRequired: 'Sign in to generate images',
    signIn: 'Sign In',
    insufficientCredits: 'Not enough credits',
    buyCredits: 'Buy Credits',
    download: 'Download Image',
    regenerate: 'Generate New',
    revisedPrompt: 'AI-enhanced prompt:',
    tips: {
      title: 'Tips for better results',
      items: [
        'Be specific about style: "oil painting", "3D render", "photograph"',
        'Describe lighting: "golden hour", "studio lighting", "dramatic shadows"',
        'Include mood: "peaceful", "mysterious", "vibrant"',
        'Specify perspective: "bird\'s eye view", "close-up", "wide angle"',
      ],
    },
    error: 'Something went wrong. Please try again.',
    promptRejected: 'Your prompt was rejected. Please try a different description.',
  },
  de: {
    title: 'KI Bildgenerator',
    subtitle: 'Erstellen Sie beeindruckende Bilder aus Textbeschreibungen mit DALL-E 3',
    promptLabel: 'Beschreiben Sie Ihr Bild',
    promptPlaceholder: 'Eine ruhige Berglandschaft bei Sonnenuntergang mit einem See, der den orangefarbenen Himmel reflektiert, fotorealistischer Stil...',
    sizeLabel: 'Bildgröße',
    sizes: {
      '1024x1024': 'Quadrat (1024×1024)',
      '1792x1024': 'Querformat (1792×1024)',
      '1024x1792': 'Hochformat (1024×1792)',
    },
    qualityLabel: 'Qualität',
    qualities: {
      standard: 'Standard',
      hd: 'HD',
    },
    styleLabel: 'Stil',
    styles: {
      vivid: 'Lebendig',
      natural: 'Natürlich',
    },
    generate: 'Bild generieren',
    generating: 'Erstelle Ihr Bild...',
    credits: 'Credits',
    signInRequired: 'Anmelden um Bilder zu generieren',
    signIn: 'Anmelden',
    insufficientCredits: 'Nicht genügend Credits',
    buyCredits: 'Credits kaufen',
    download: 'Bild herunterladen',
    regenerate: 'Neu generieren',
    revisedPrompt: 'KI-verbesserter Prompt:',
    tips: {
      title: 'Tipps für bessere Ergebnisse',
      items: [
        'Stil angeben: "Ölgemälde", "3D-Rendering", "Fotografie"',
        'Beleuchtung beschreiben: "goldene Stunde", "Studiolicht", "dramatische Schatten"',
        'Stimmung einbeziehen: "friedlich", "mysteriös", "lebhaft"',
        'Perspektive festlegen: "Vogelperspektive", "Nahaufnahme", "Weitwinkel"',
      ],
    },
    error: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
    promptRejected: 'Ihr Prompt wurde abgelehnt. Bitte versuchen Sie eine andere Beschreibung.',
  },
};

const CREDIT_COSTS = {
  '1024x1024': { standard: 5, hd: 8 },
  '1792x1024': { standard: 5, hd: 10 },
  '1024x1792': { standard: 5, hd: 10 },
};

export default function AIImageGeneratorClient({ lng }: AIImageGeneratorClientProps) {
  const t = content[lng];
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
  const [quality, setQuality] = useState<'standard' | 'hd'>('standard');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const { openShareModal, ShareModalComponent } = useShareModal(
    t.title,
    `/${lng}/tools/ai-image-generator`,
    lng
  );

  const currentCost = CREDIT_COSTS[size][quality];

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || prompt.length < 10) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setRevisedPrompt(null);

    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size, quality, style }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError(t.insufficientCredits);
        } else if (response.status === 400) {
          setError(t.promptRejected);
        } else {
          setError(data.error || t.error);
        }
        return;
      }

      setGeneratedImage(data.imageUrl);
      setRevisedPrompt(data.revisedPrompt);
      setUserCredits(data.newBalance);

      // Show share modal after successful generation
      setTimeout(() => openShareModal(prompt.substring(0, 50) + '...'), 1000);
    } catch {
      setError(t.error);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, size, quality, style, t, openShareModal]);

  const downloadImage = useCallback(async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `puretools-ai-image-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(generatedImage, '_blank');
    }
  }, [generatedImage]);

  const isAuthenticated = status === 'authenticated';
  const canGenerate = isAuthenticated && prompt.trim().length >= 10 && !isGenerating;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/10 dark:to-pink-500/10 p-3">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>

          {/* Credits display */}
          {isAuthenticated && userCredits !== null && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-4 py-2 text-sm text-purple-700 dark:text-purple-400">
              <CreditCard className="h-4 w-4" />
              {t.credits}: {userCredits}
            </div>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Prompt Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.promptLabel}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.promptPlaceholder}
                rows={5}
                maxLength={4000}
                className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-500 transition-colors resize-none"
              />
              <div className="mt-1 text-right text-xs text-zinc-500">
                {prompt.length}/4000
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.sizeLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1024x1024', '1792x1024', '1024x1792'] as const).map((s) => {
                  const icons = {
                    '1024x1024': Square,
                    '1792x1024': RectangleHorizontal,
                    '1024x1792': RectangleVertical,
                  };
                  const Icon = icons[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                        size === s
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-purple-300 dark:hover:border-purple-500/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{t.sizes[s].split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Style */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Zap className="h-4 w-4" />
                  {t.qualityLabel}
                </label>
                <div className="flex gap-2">
                  {(['standard', 'hd'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                        quality === q
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-purple-300'
                      }`}
                    >
                      {t.qualities[q]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Palette className="h-4 w-4" />
                  {t.styleLabel}
                </label>
                <div className="flex gap-2">
                  {(['vivid', 'natural'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStyle(st)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                        style === st
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-purple-300'
                      }`}
                    >
                      {t.styles[st]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Preview */}
            <div className="rounded-xl border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-700 dark:text-purple-400">
                  {t.credits}
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {currentCost} Credits
                </span>
              </div>
            </div>

            {/* Generate Button */}
            {!isAuthenticated ? (
              <Link
                href={`/${lng}/auth/signin`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-400"
              >
                {t.signIn}
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                onClick={generateImage}
                disabled={!canGenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    {t.generate} ({currentCost} Credits)
                  </>
                )}
              </motion.button>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                  {error === t.insufficientCredits && (
                    <Link
                      href={`/${lng}/pricing`}
                      className="ml-auto font-medium underline"
                    >
                      {t.buyCredits}
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t.tips.title}
              </h3>
              <ul className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t.tips.items.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {generatedImage ? t.revisedPrompt.split(':')[0] : 'Preview'}
            </div>

            <div className="relative flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden min-h-[400px]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-purple-200 dark:border-purple-500/30" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{t.generating}</p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                  <ImageIcon className="h-16 w-16 mb-4" />
                  <p className="text-sm">{lng === 'de' ? 'Ihr Bild erscheint hier' : 'Your image will appear here'}</p>
                </div>
              )}
            </div>

            {/* Revised Prompt */}
            {revisedPrompt && (
              <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">{t.revisedPrompt}</span> {revisedPrompt}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {generatedImage && (
              <div className="mt-4 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadImage}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-500 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-colors hover:bg-purple-400"
                >
                  <Download className="h-5 w-5" />
                  {t.download}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateImage}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 font-semibold text-zinc-800 dark:text-white transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <RefreshCw className="h-5 w-5" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModalComponent />
    </div>
  );
}
