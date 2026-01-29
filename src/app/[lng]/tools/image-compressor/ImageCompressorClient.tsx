'use client';

import { useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageDown,
  Upload,
  Download,
  Trash2,
  Shield,
  Settings,
  X,
  Check,
  Loader2,
  FileImage,
  ArrowRight,
  Zap,
  Gauge,
  Monitor,
  Smartphone,
  Globe,
  Sliders,
  Info,
  Clock,
} from 'lucide-react';
import { Language } from '@/i18n/settings';
import { useWatermark } from '@/components/WatermarkToggle';
import { addWatermarkToImage } from '@/lib/watermark';
import { useHistory } from '@/hooks/useHistory';

/**
 * Compress image to get as close as possible to target size without exceeding it.
 * Uses binary search to find optimal quality.
 */
async function compressToTargetSize(
  file: File,
  targetSizeMB: number,
  maxWidthOrHeight: number,
  fileType?: string
): Promise<Blob> {
  const targetSizeBytes = targetSizeMB * 1024 * 1024;

  // If file is already under target, return as-is (optionally resize)
  if (file.size <= targetSizeBytes) {
    // Still apply resize if needed
    const resized = await imageCompression(file, {
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 1,
      fileType: fileType as 'image/jpeg' | 'image/png' | 'image/webp' | undefined,
    });
    return resized;
  }

  // Binary search for optimal quality
  let minQuality = 0.1;
  let maxQuality = 1.0;
  let bestResult: Blob | null = null;
  let bestQuality = minQuality;

  // First, try with max quality to see if we can even get under target with just resize
  const maxQualityResult = await imageCompression(file, {
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: 1.0,
    fileType: fileType as 'image/jpeg' | 'image/png' | 'image/webp' | undefined,
  });

  if (maxQualityResult.size <= targetSizeBytes) {
    return maxQualityResult;
  }

  // Binary search iterations
  for (let i = 0; i < 8; i++) {
    const midQuality = (minQuality + maxQuality) / 2;

    const result = await imageCompression(file, {
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: midQuality,
      fileType: fileType as 'image/jpeg' | 'image/png' | 'image/webp' | undefined,
    });

    if (result.size <= targetSizeBytes) {
      // Under target - this is a valid result, try higher quality
      bestResult = result;
      bestQuality = midQuality;
      minQuality = midQuality;
    } else {
      // Over target - need lower quality
      maxQuality = midQuality;
    }

    // If we're within 5% of target, good enough
    if (bestResult && bestResult.size >= targetSizeBytes * 0.95) {
      break;
    }
  }

  // If no valid result found, use minimum quality
  if (!bestResult) {
    bestResult = await imageCompression(file, {
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 0.1,
      fileType: fileType as 'image/jpeg' | 'image/png' | 'image/webp' | undefined,
    });
  }

  return bestResult;
}

interface ImageCompressorClientProps {
  lng: Language;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  compressed?: Blob;
  compressedPreview?: string;
  originalSize: number;
  compressedSize?: number;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
  compressionTime?: number;
}

interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
  fileType: 'original' | 'jpeg' | 'png' | 'webp';
}

type PresetKey = 'low' | 'medium' | 'high' | 'web' | 'social' | 'print' | 'custom';

const content = {
  en: {
    title: 'Image Compressor',
    subtitle: 'Compress images up to 90% smaller while keeping great quality. All processing happens locally.',
    dropzone: {
      title: 'Drop images here',
      subtitle: 'or click to select (JPG, PNG, WebP, GIF)',
      bulk: 'Supports bulk upload',
    },
    presets: {
      title: 'Compression Preset',
      low: { name: 'Light', desc: 'Minimal compression, best quality' },
      medium: { name: 'Balanced', desc: 'Good balance of size & quality' },
      high: { name: 'Maximum', desc: 'Smallest file size' },
      web: { name: 'Web', desc: 'Optimized for websites' },
      social: { name: 'Social', desc: 'Perfect for Instagram, Twitter' },
      print: { name: 'Print', desc: 'High quality for printing' },
      custom: { name: 'Custom', desc: 'Advanced settings' },
    },
    settings: {
      title: 'Advanced Settings',
      quality: 'Quality',
      qualityHint: 'Higher = better quality, larger file',
      maxSize: 'Target Size (MB)',
      maxSizeHint: 'Maximum file size after compression',
      resolution: 'Max Resolution',
      resolutionHint: 'Resize images larger than this',
      format: 'Output Format',
      formatHint: 'Convert to different format',
      resolutionPresets: {
        original: 'Original',
        '4k': '4K (3840px)',
        'fullhd': 'Full HD (1920px)',
        'hd': 'HD (1280px)',
        'web': 'Web (1024px)',
        'thumb': 'Thumbnail (512px)',
      },
    },
    stats: {
      images: 'Images',
      original: 'Original',
      compressed: 'Compressed',
      saved: 'Saved',
      clearAll: 'Clear All',
      downloadAll: 'Download All',
    },
    actions: {
      compress: 'Compress Images',
      compressing: 'Compressing...',
      download: 'Download',
    },
    efficiency: {
      title: 'Efficiency Score',
      processed: 'Processed locally in',
      savings: 'Total savings',
      privacy: '100% Privacy preserved',
      serverCost: 'Server costs saved: 100%',
    },
    transparency: {
      badge: 'Free & Local',
      tooltip: 'This tool runs entirely in your browser using WebAssembly. Your images never leave your device.',
      whyFree: 'Why is this free?',
      explanation: 'The processing runs on your CPU, not our servers. No API costs = no charges for you.',
    },
  },
  de: {
    title: 'Bildkompressor',
    subtitle: 'Bilder bis zu 90% kleiner komprimieren bei großartiger Qualität. Verarbeitung erfolgt lokal.',
    dropzone: {
      title: 'Bilder hier ablegen',
      subtitle: 'oder klicken zum Auswählen (JPG, PNG, WebP, GIF)',
      bulk: 'Unterstützt Massen-Upload',
    },
    presets: {
      title: 'Komprimierungs-Preset',
      low: { name: 'Leicht', desc: 'Minimale Komprimierung, beste Qualität' },
      medium: { name: 'Ausgewogen', desc: 'Gute Balance aus Größe & Qualität' },
      high: { name: 'Maximum', desc: 'Kleinste Dateigröße' },
      web: { name: 'Web', desc: 'Optimiert für Websites' },
      social: { name: 'Social', desc: 'Perfekt für Instagram, Twitter' },
      print: { name: 'Druck', desc: 'Hohe Qualität für Drucke' },
      custom: { name: 'Angepasst', desc: 'Erweiterte Einstellungen' },
    },
    settings: {
      title: 'Erweiterte Einstellungen',
      quality: 'Qualität',
      qualityHint: 'Höher = bessere Qualität, größere Datei',
      maxSize: 'Zielgröße (MB)',
      maxSizeHint: 'Maximale Dateigröße nach Komprimierung',
      resolution: 'Max. Auflösung',
      resolutionHint: 'Größere Bilder werden verkleinert',
      format: 'Ausgabeformat',
      formatHint: 'In anderes Format konvertieren',
      resolutionPresets: {
        original: 'Original',
        '4k': '4K (3840px)',
        'fullhd': 'Full HD (1920px)',
        'hd': 'HD (1280px)',
        'web': 'Web (1024px)',
        'thumb': 'Vorschau (512px)',
      },
    },
    stats: {
      images: 'Bilder',
      original: 'Original',
      compressed: 'Komprimiert',
      saved: 'Gespart',
      clearAll: 'Alle löschen',
      downloadAll: 'Alle herunterladen',
    },
    actions: {
      compress: 'Bilder komprimieren',
      compressing: 'Komprimiere...',
      download: 'Herunterladen',
    },
    efficiency: {
      title: 'Effizienz-Score',
      processed: 'Lokal verarbeitet in',
      savings: 'Gesamtersparnis',
      privacy: '100% Privatsphäre gewahrt',
      serverCost: 'Serverkosten gespart: 100%',
    },
    transparency: {
      badge: 'Kostenlos & Lokal',
      tooltip: 'Dieses Tool läuft vollständig in deinem Browser mit WebAssembly. Deine Bilder verlassen nie dein Gerät.',
      whyFree: 'Warum ist das kostenlos?',
      explanation: 'Die Verarbeitung läuft auf deiner CPU, nicht auf unseren Servern. Keine API-Kosten = keine Kosten für dich.',
    },
  },
};

const presetSettings: Record<PresetKey, Omit<CompressionSettings, 'fileType'>> = {
  low: { maxSizeMB: 5, maxWidthOrHeight: 4096, quality: 0.92 },
  medium: { maxSizeMB: 2, maxWidthOrHeight: 2048, quality: 0.82 },
  high: { maxSizeMB: 0.5, maxWidthOrHeight: 1920, quality: 0.65 },
  web: { maxSizeMB: 0.3, maxWidthOrHeight: 1920, quality: 0.75 },
  social: { maxSizeMB: 1, maxWidthOrHeight: 1080, quality: 0.85 },
  print: { maxSizeMB: 10, maxWidthOrHeight: 4096, quality: 0.95 },
  custom: { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.8 },
};

const resolutionPresets = {
  original: 99999,
  '4k': 3840,
  'fullhd': 1920,
  'hd': 1280,
  'web': 1024,
  'thumb': 512,
};

export default function ImageCompressorClient({ lng }: ImageCompressorClientProps) {
  const t = content[lng];
  const { saveToHistory } = useHistory();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [preset, setPreset] = useState<PresetKey>('medium');
  const [settings, setSettings] = useState<CompressionSettings>({
    ...presetSettings.medium,
    fileType: 'original',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);
  const [totalCompressionTime, setTotalCompressionTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { watermarkEnabled, WatermarkToggle } = useWatermark(true);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number): number => {
    return Math.round(((original - compressed) / original) * 100);
  };

  const handlePresetChange = (newPreset: PresetKey) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      setSettings(prev => ({
        ...presetSettings[newPreset],
        fileType: prev.fileType,
      }));
      setShowSettings(false);
    } else {
      setShowSettings(true);
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles: ImageFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending' as const,
      }));
    setImages(prev => [...prev, ...imageFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles: ImageFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending' as const,
      }));
    setImages(prev => [...prev, ...imageFiles]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.compressedPreview) URL.revokeObjectURL(image.compressedPreview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.compressedPreview) URL.revokeObjectURL(img.compressedPreview);
    });
    setImages([]);
    setTotalCompressionTime(0);
  }, [images]);

  const compressImages = useCallback(async () => {
    setIsCompressing(true);
    const startTime = performance.now();
    const pendingImages = images.filter(img => img.status === 'pending');

    for (const image of pendingImages) {
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, status: 'compressing' as const } : img
      ));

      const imgStart = performance.now();

      try {
        const fileType = settings.fileType === 'original' ? undefined : `image/${settings.fileType}`;

        // Use iterative compression to get closer to target size
        const compressedFile = await compressToTargetSize(
          image.file,
          settings.maxSizeMB,
          settings.maxWidthOrHeight,
          fileType
        );
        const compressedPreview = URL.createObjectURL(compressedFile);
        const compressionTime = performance.now() - imgStart;

        setImages(prev => prev.map(img =>
          img.id === image.id
            ? {
                ...img,
                compressed: compressedFile,
                compressedPreview,
                compressedSize: compressedFile.size,
                status: 'done' as const,
                compressionTime,
              }
            : img
        ));

        // Save to history
        saveToHistory({
          toolType: 'image-compressor',
          title: `Compressed: ${image.file.name}`,
          inputData: {
            fileName: image.file.name,
            originalSize: image.originalSize,
            preset,
            quality: settings.quality,
          },
          outputData: {
            compressedSize: compressedFile.size,
            savings: calculateSavings(image.originalSize, compressedFile.size),
          },
        });
      } catch (error) {
        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'error' as const, error: error instanceof Error ? error.message : 'Failed' }
            : img
        ));
      }
    }

    setTotalCompressionTime(performance.now() - startTime);
    setIsCompressing(false);
  }, [images, settings, preset, saveToHistory]);

  const downloadImage = useCallback(async (image: ImageFile) => {
    if (!image.compressed) return;
    const ext = settings.fileType === 'original' ? image.file.name.split('.').pop() : settings.fileType;
    const baseName = image.file.name.replace(/\.[^/.]+$/, '');

    let blobToDownload = image.compressed;

    if (watermarkEnabled) {
      try {
        blobToDownload = await addWatermarkToImage(image.compressed);
      } catch {
        // Fallback to original if watermarking fails
      }
    }

    const url = URL.createObjectURL(blobToDownload);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_compressed.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [settings.fileType, watermarkEnabled]);

  const downloadAll = useCallback(() => {
    images.filter(img => img.status === 'done' && img.compressed).forEach(img => downloadImage(img));
  }, [images, downloadImage]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images.filter(img => img.compressedSize).reduce((sum, img) => sum + (img.compressedSize || 0), 0);
  const completedCount = images.filter(img => img.status === 'done').length;
  const totalSavingsPercent = totalOriginalSize > 0 ? calculateSavings(totalOriginalSize, totalCompressedSize) : 0;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 p-4">
            <ImageDown className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>

          {/* Transparency Badge - Fair Play Funnel */}
          <div className="mt-6 inline-flex flex-col items-center">
            <button
              onClick={() => setShowTransparency(!showTransparency)}
              className="group flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
            >
              <Shield className="h-4 w-4" />
              {t.transparency.badge}
              <Info className="h-3 w-3 opacity-50 group-hover:opacity-100" />
            </button>

            <AnimatePresence>
              {showTransparency && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mt-3 max-w-md rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-4 text-left"
                >
                  <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">{t.transparency.whyFree}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.transparency.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Preset Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.presets.title}</h3>
            <button
              onClick={() => handlePresetChange('custom')}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <Sliders className="h-3 w-3" />
              {t.presets.custom.name}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {(['low', 'medium', 'high', 'web', 'social', 'print'] as PresetKey[]).map((key) => {
              const presetContent = t.presets[key];
              const icons: Record<string, React.ReactNode> = {
                low: <Gauge className="h-4 w-4" />,
                medium: <Zap className="h-4 w-4" />,
                high: <ImageDown className="h-4 w-4" />,
                web: <Globe className="h-4 w-4" />,
                social: <Smartphone className="h-4 w-4" />,
                print: <Monitor className="h-4 w-4" />,
              };
              return (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                    preset === key
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {icons[key]}
                  <span className="text-xs font-medium">{presetContent.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quality Slider - Always Visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.settings.quality}</label>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(settings.quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={settings.quality}
            onChange={(e) => {
              setSettings({ ...settings, quality: parseFloat(e.target.value) });
              setPreset('custom');
            }}
            className="w-full h-3 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${settings.quality * 100}%, #e4e4e7 ${settings.quality * 100}%, #e4e4e7 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs text-zinc-500">
            <span>{lng === 'de' ? 'Kleinste Datei' : 'Smallest File'}</span>
            <span>{lng === 'de' ? 'Beste Qualität' : 'Best Quality'}</span>
          </div>
        </motion.div>

        {/* Advanced Settings */}
        <AnimatePresence>
          {(showSettings || preset === 'custom') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-500 dark:text-zinc-500" />
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.settings.title}</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">{t.settings.maxSize}</label>
                    <input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={isNaN(settings.maxSizeMB) ? '' : settings.maxSizeMB}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setSettings({ ...settings, maxSizeMB: isNaN(value) ? 1 : value });
                      }}
                      className="w-full rounded-lg border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-zinc-500">{t.settings.maxSizeHint}</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">{t.settings.resolution}</label>
                    <select
                      value={Object.entries(resolutionPresets).find(([, v]) => v === settings.maxWidthOrHeight)?.[0] || 'fullhd'}
                      onChange={(e) => setSettings({ ...settings, maxWidthOrHeight: resolutionPresets[e.target.value as keyof typeof resolutionPresets] })}
                      className="w-full rounded-lg border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    >
                      {Object.entries(t.settings.resolutionPresets).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">{t.settings.format}</label>
                    <select
                      value={settings.fileType}
                      onChange={(e) => setSettings({ ...settings, fileType: e.target.value as CompressionSettings['fileType'] })}
                      className="w-full rounded-lg border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    >
                      <option value="original">Original</option>
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 p-12 text-center transition-all hover:border-indigo-400 dark:hover:border-emerald-500/50 hover:from-indigo-100/80 hover:to-purple-100/50 dark:hover:bg-zinc-900"
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-indigo-400 dark:text-zinc-500" />
          <p className="mb-2 text-lg font-medium text-zinc-800 dark:text-white">{t.dropzone.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-500">{t.dropzone.subtitle}</p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">{t.dropzone.bulk}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>

        {/* Image List */}
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-zinc-500">{t.stats.images}</div>
                  <div className="text-lg font-semibold text-zinc-800 dark:text-white">{images.length}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">{t.stats.original}</div>
                  <div className="text-lg font-semibold text-zinc-800 dark:text-white">{formatBytes(totalOriginalSize)}</div>
                </div>
                {totalCompressedSize > 0 && (
                  <>
                    <ArrowRight className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                    <div>
                      <div className="text-xs text-zinc-500">{t.stats.compressed}</div>
                      <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatBytes(totalCompressedSize)}</div>
                    </div>
                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1">
                      <div className="text-xs text-zinc-500">{t.stats.saved}</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">-{totalSavingsPercent}%</div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {t.stats.clearAll}
                </button>
                {completedCount > 0 && (
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
                  >
                    <Download className="h-4 w-4" />
                    {t.stats.downloadAll} ({completedCount})
                  </button>
                )}
              </div>
            </div>

            {/* Efficiency Score - Fair Play Funnel */}
            {completedCount > 0 && totalCompressionTime > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50 dark:from-emerald-500/10 to-transparent p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-medium text-zinc-800 dark:text-white">{t.efficiency.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <div>
                      <div className="text-xs text-zinc-500">{t.efficiency.processed}</div>
                      <div className="text-sm font-medium text-zinc-800 dark:text-white">{(totalCompressionTime / 1000).toFixed(2)}s</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageDown className="h-4 w-4 text-zinc-500" />
                    <div>
                      <div className="text-xs text-zinc-500">{t.efficiency.savings}</div>
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatBytes(totalOriginalSize - totalCompressedSize)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-zinc-500" />
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">{t.efficiency.privacy}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-zinc-500" />
                    <div className="text-sm text-emerald-600 dark:text-emerald-400">{t.efficiency.serverCost}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Image Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {images.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative overflow-hidden rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={image.compressedPreview || image.preview}
                        alt={image.file.name}
                        className="h-full w-full object-cover"
                      />
                      {image.status === 'compressing' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                        </div>
                      )}
                      {image.status === 'done' && (
                        <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute left-2 top-2 rounded-full bg-white/80 dark:bg-zinc-900/80 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-indigo-500 dark:text-zinc-500" />
                        <span className="truncate text-sm text-zinc-800 dark:text-white">{image.file.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">{formatBytes(image.originalSize)}</span>
                        {image.compressedSize && (
                          <>
                            <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                            <span className="text-emerald-600 dark:text-emerald-400">{formatBytes(image.compressedSize)}</span>
                            <span className="rounded bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              -{calculateSavings(image.originalSize, image.compressedSize)}%
                            </span>
                          </>
                        )}
                      </div>
                      {image.status === 'done' && (
                        <button
                          onClick={() => downloadImage(image)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-100 dark:bg-zinc-800 py-2 text-sm text-indigo-700 dark:text-white hover:bg-indigo-200 dark:hover:bg-zinc-700"
                        >
                          <Download className="h-4 w-4" />
                          {t.actions.download}
                        </button>
                      )}
                      {image.status === 'error' && (
                        <div className="mt-2 text-sm text-red-500 dark:text-red-400">{image.error}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Watermark Toggle */}
            <div className="flex justify-center">
              <WatermarkToggle lng={lng} />
            </div>

            {/* Compress Button */}
            {images.some(img => img.status === 'pending') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4">
                <button
                  onClick={compressImages}
                  disabled={isCompressing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t.actions.compressing}
                    </>
                  ) : (
                    <>
                      <ImageDown className="h-5 w-5" />
                      {t.actions.compress}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
