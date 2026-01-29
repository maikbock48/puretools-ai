'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  ImageDown,
  Image,
  FileText,
  FileImage,
  Film,
  ScanText,
  Scissors,
  Eraser,
  Braces,
  Languages,
  FileAudio,
  Shield,
  Sparkles,
  Wifi,
  Music,
  Crop,
  Wine,
  Sticker,
  CreditCard,
  Wand2,
  Video,
  Mic2,
  Star,
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';
import ToolCard from './ToolCard';
import { useFavoriteTools } from '@/hooks/useFavoriteTools';

interface ToolsGridProps {
  lng: Language;
}

const localTools = [
  { key: 'qrGenerator', icon: QrCode, path: 'qr-generator' },
  { key: 'imageCompressor', icon: ImageDown, path: 'image-compressor' },
  { key: 'heicConverter', icon: Image, path: 'heic-converter' },
  { key: 'pdfToolkit', icon: FileText, path: 'pdf-toolkit' },
  { key: 'pdfToJpg', icon: FileImage, path: 'pdf-to-jpg' },
  { key: 'videoTrimmer', icon: Film, path: 'video-trimmer' },
  { key: 'wifiQr', icon: Wifi, path: 'wifi-qr' },
  { key: 'ocr', icon: ScanText, path: 'ocr-scanner' },
  { key: 'audioCutter', icon: Scissors, path: 'audio-cutter' },
  { key: 'audioConverter', icon: Music, path: 'audio-converter' },
  { key: 'socialCropper', icon: Crop, path: 'social-cropper' },
  { key: 'bacCalculator', icon: Wine, path: 'bac-calculator' },
  { key: 'stickerMaker', icon: Sticker, path: 'sticker-maker' },
  { key: 'qrBusinessCard', icon: CreditCard, path: 'qr-business-card' },
  { key: 'backgroundRemover', icon: Eraser, path: 'background-remover' },
  { key: 'jsonFormatter', icon: Braces, path: 'json-formatter' },
] as const;

const aiTools = [
  { key: 'aiTranslator', icon: Languages, path: 'ai-translator' },
  { key: 'aiTranscriber', icon: FileAudio, path: 'ai-transcriber' },
  { key: 'aiSummarizer', icon: FileText, path: 'ai-summarizer' },
  { key: 'aiImageGenerator', icon: Wand2, path: 'ai-image-generator' },
  { key: 'aiVideoGenerator', icon: Video, path: 'ai-video-generator' },
  { key: 'aiVoiceGenerator', icon: Mic2, path: 'ai-voice-generator' },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

// All tools combined for favorites lookup
const allTools = [...localTools, ...aiTools];

// Tool icon mapping for favorites section
const toolIconMap: Record<string, typeof QrCode> = {
  qrGenerator: QrCode,
  imageCompressor: ImageDown,
  heicConverter: Image,
  pdfToolkit: FileText,
  pdfToJpg: FileImage,
  videoTrimmer: Film,
  wifiQr: Wifi,
  ocr: ScanText,
  audioCutter: Scissors,
  audioConverter: Music,
  socialCropper: Crop,
  bacCalculator: Wine,
  stickerMaker: Sticker,
  qrBusinessCard: CreditCard,
  backgroundRemover: Eraser,
  jsonFormatter: Braces,
  aiTranslator: Languages,
  aiTranscriber: FileAudio,
  aiSummarizer: FileText,
  aiImageGenerator: Wand2,
  aiVideoGenerator: Video,
  aiVoiceGenerator: Mic2,
};

export default function ToolsGrid({ lng }: ToolsGridProps) {
  const { t } = useTranslation(lng);
  const { favorites, isLoaded, toggleFavorite, isFavorite } = useFavoriteTools();

  // Get favorite tools data
  const favoriteTools = favorites
    .map((key) => allTools.find((tool) => tool.key === key))
    .filter((tool): tool is (typeof allTools)[number] => tool !== undefined);

  return (
    <section id="tools" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Favorites Section - Only show if there are favorites */}
        {isLoaded && favoriteTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <div className="flex flex-col items-center gap-3 mb-2 text-center">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('categories.favorites')}</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">{t('categories.favoritesDescription')}</p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {favoriteTools.map((tool) => {
                const isAiTool = aiTools.some((ai) => ai.key === tool.key);
                return (
                  <motion.div key={tool.key} variants={itemVariants}>
                    <ToolCard
                      lng={lng}
                      title={t(`tools.${tool.key}.title`)}
                      description={t(`tools.${tool.key}.description`)}
                      href={`/${lng}/tools/${tool.path}`}
                      icon={toolIconMap[tool.key] || QrCode}
                      variant={isAiTool ? 'ai' : 'local'}
                      toolKey={tool.key}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* Local Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex flex-col items-center gap-3 mb-2 text-center">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('categories.local')}</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">{t('categories.localDescription')}</p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {localTools.map((tool) => (
              <motion.div key={tool.key} variants={itemVariants}>
                <ToolCard
                  lng={lng}
                  title={t(`tools.${tool.key}.title`)}
                  description={t(`tools.${tool.key}.description`)}
                  href={`/${lng}/tools/${tool.path}`}
                  icon={tool.icon}
                  variant="local"
                  toolKey={tool.key}
                  isFavorite={isFavorite(tool.key)}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* AI Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col items-center gap-3 mb-2 text-center">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('categories.ai')}</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-center mb-8">{t('categories.aiDescription')}</p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {aiTools.map((tool) => (
              <motion.div key={tool.key} variants={itemVariants}>
                <ToolCard
                  lng={lng}
                  title={t(`tools.${tool.key}.title`)}
                  description={t(`tools.${tool.key}.description`)}
                  href={`/${lng}/tools/${tool.path}`}
                  icon={tool.icon}
                  variant="ai"
                  toolKey={tool.key}
                  isFavorite={isFavorite(tool.key)}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-400 shadow-sm backdrop-blur-sm">
            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t('common.privacyNote')}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
