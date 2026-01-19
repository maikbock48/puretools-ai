'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  ImageDown,
  Image,
  FileText,
  ScanText,
  Scissors,
  Eraser,
  Braces,
  Languages,
  FileAudio,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';
import ToolCard from './ToolCard';

interface ToolsGridProps {
  lng: Language;
}

const localTools = [
  { key: 'qrGenerator', icon: QrCode, path: 'qr-generator' },
  { key: 'imageCompressor', icon: ImageDown, path: 'image-compressor' },
  { key: 'heicConverter', icon: Image, path: 'heic-converter' },
  { key: 'pdfToolkit', icon: FileText, path: 'pdf-toolkit' },
  { key: 'ocr', icon: ScanText, path: 'ocr' },
  { key: 'audioCutter', icon: Scissors, path: 'audio-cutter' },
  { key: 'backgroundRemover', icon: Eraser, path: 'background-remover' },
  { key: 'jsonFormatter', icon: Braces, path: 'json-formatter' },
] as const;

const aiTools = [
  { key: 'aiTranslator', icon: Languages, path: 'ai-translator' },
  { key: 'aiTranscriber', icon: FileAudio, path: 'ai-transcriber' },
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

export default function ToolsGrid({ lng }: ToolsGridProps) {
  const { t } = useTranslation(lng);

  return (
    <section id="tools" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Local Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('categories.local')}</h2>
          </div>
          <p className="text-zinc-400 ml-12 mb-8">{t('categories.localDescription')}</p>

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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('categories.ai')}</h2>
          </div>
          <p className="text-zinc-400 ml-12 mb-8">{t('categories.aiDescription')}</p>

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
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400">
            <Shield className="h-4 w-4 text-emerald-400" />
            {t('common.privacyNote')}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
