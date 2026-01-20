'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Eraser,
  Upload,
  Download,
  Loader2,
  Image as ImageIcon,
  X,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface BackgroundRemoverClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Background Remover',
    subtitle: 'Remove backgrounds from images using AI, 100% locally in your browser. No uploads to any server.',
    dropzone: 'Drop an image here or click to upload',
    supported: 'Supports: PNG, JPG, JPEG, WebP',
    processing: 'Removing background...',
    loadingModel: 'Loading AI model...',
    progress: 'Progress',
    original: 'Original',
    result: 'Result',
    download: 'Download PNG',
    clear: 'Clear',
    tryAnother: 'Try Another Image',
    features: {
      title: 'Features',
      items: [
        { title: 'AI-Powered', desc: 'Uses advanced AI for precise cutouts' },
        { title: '100% Private', desc: 'Runs entirely in your browser' },
        { title: 'No Watermarks', desc: 'Get clean results, always free' },
        { title: 'High Quality', desc: 'Preserves fine details and edges' },
      ],
    },
    tips: {
      title: 'Tips for Best Results',
      items: [
        'Use images with clear subject-background contrast',
        'Higher resolution images produce better results',
        'Works best with people, products, and animals',
      ],
    },
  },
  de: {
    title: 'Hintergrund Entfernen',
    subtitle: 'Entfernen Sie Hintergründe aus Bildern mit KI, 100% lokal in Ihrem Browser. Keine Uploads zu Servern.',
    dropzone: 'Bild hier ablegen oder klicken zum Hochladen',
    supported: 'Unterstützt: PNG, JPG, JPEG, WebP',
    processing: 'Hintergrund wird entfernt...',
    loadingModel: 'KI-Modell wird geladen...',
    progress: 'Fortschritt',
    original: 'Original',
    result: 'Ergebnis',
    download: 'PNG herunterladen',
    clear: 'Leeren',
    tryAnother: 'Anderes Bild versuchen',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'KI-gestützt', desc: 'Verwendet fortschrittliche KI für präzise Ausschnitte' },
        { title: '100% Privat', desc: 'Läuft vollständig in Ihrem Browser' },
        { title: 'Keine Wasserzeichen', desc: 'Saubere Ergebnisse, immer kostenlos' },
        { title: 'Hohe Qualität', desc: 'Erhält feine Details und Kanten' },
      ],
    },
    tips: {
      title: 'Tipps für beste Ergebnisse',
      items: [
        'Verwenden Sie Bilder mit klarem Motiv-Hintergrund-Kontrast',
        'Höhere Auflösung ergibt bessere Ergebnisse',
        'Funktioniert am besten mit Personen, Produkten und Tieren',
      ],
    },
  },
};

export default function BackgroundRemoverClient({ lng }: BackgroundRemoverClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const processImage = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setOriginalImage(imageData);
      setImageName(file.name);
      setResultImage(null);
      setIsProcessing(true);
      setProgress(0);
      setProgressMessage(t.loadingModel);

      try {
        const { removeBackground } = await import('@imgly/background-removal');

        const blob = await removeBackground(imageData, {
          progress: (key, current, total) => {
            const percentage = Math.round((current / total) * 100);
            setProgress(percentage);
            if (key === 'fetch:model') {
              setProgressMessage(t.loadingModel);
            } else {
              setProgressMessage(t.processing);
            }
          },
        });

        const resultUrl = URL.createObjectURL(blob);
        setResultImage(resultUrl);
      } catch (error) {
        console.error('Background removal error:', error);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      const a = document.createElement('a');
      a.href = resultImage;
      a.download = `${imageName.replace(/\.[^/.]+$/, '')}_nobg.png`;
      a.click();
    }
  };

  const clearAll = () => {
    setOriginalImage(null);
    setResultImage(null);
    setImageName('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-violet-100 dark:bg-violet-500/10 p-4">
            <Eraser className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Main Content */}
        {!originalImage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-violet-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
              <p className="mb-2 text-zinc-700 dark:text-zinc-300">{t.dropzone}</p>
              <p className="text-sm text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Image Comparison */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Original */}
              <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.original}</span>
                  <button
                    onClick={clearAll}
                    className="rounded-lg p-1 text-indigo-600 dark:text-zinc-400 hover:bg-indigo-100 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-indigo-50 dark:bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalImage}
                    alt="Original"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.result}</span>
                  {resultImage && (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div
                  className="relative aspect-square overflow-hidden rounded-xl"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#18181b',
                  }}
                >
                  {isProcessing ? (
                    <div className="flex h-full flex-col items-center justify-center">
                      <Loader2 className="mb-4 h-12 w-12 animate-spin text-violet-400" />
                      <p className="mb-2 text-sm text-zinc-300">{progressMessage}</p>
                      <div className="w-48">
                        <div className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-zinc-800">
                          <div
                            className="h-full bg-violet-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-zinc-500">{progress}%</p>
                      </div>
                    </div>
                  ) : resultImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resultImage}
                      alt="Result"
                      className="h-full w-full object-contain"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Actions */}
            {resultImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex justify-center gap-4"
              >
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-400"
                >
                  <Download className="h-4 w-4" />
                  {t.download}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-6 py-3 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600"
                >
                  <ImageIcon className="h-4 w-4" />
                  {t.tryAnother}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Tips */}
        {!originalImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 font-medium text-zinc-800 dark:text-white">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              {t.tips.title}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t.tips.items.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <Sparkles className="mb-2 h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="mb-1 font-medium text-zinc-800 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
