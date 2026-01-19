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
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

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
}

interface CompressionSettings {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
  fileType: 'original' | 'jpeg' | 'png' | 'webp';
}

const defaultSettings: CompressionSettings = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  quality: 0.8,
  fileType: 'original',
};

export default function ImageCompressorClient({ lng }: ImageCompressorClientProps) {
  const { t } = useTranslation(lng);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateSavings = (original: number, compressed: number): string => {
    const savings = ((original - compressed) / original) * 100;
    return savings.toFixed(1);
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
        if (image.compressedPreview) {
          URL.revokeObjectURL(image.compressedPreview);
        }
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.compressedPreview) {
        URL.revokeObjectURL(img.compressedPreview);
      }
    });
    setImages([]);
  }, [images]);

  const compressImages = useCallback(async () => {
    setIsCompressing(true);

    const pendingImages = images.filter(img => img.status === 'pending');

    for (const image of pendingImages) {
      setImages(prev =>
        prev.map(img =>
          img.id === image.id ? { ...img, status: 'compressing' as const } : img
        )
      );

      try {
        const options = {
          maxSizeMB: settings.maxSizeMB,
          maxWidthOrHeight: settings.maxWidthOrHeight,
          useWebWorker: true,
          initialQuality: settings.quality,
          fileType: settings.fileType === 'original' ? undefined : `image/${settings.fileType}`,
        };

        const compressedFile = await imageCompression(image.file, options);
        const compressedPreview = URL.createObjectURL(compressedFile);

        setImages(prev =>
          prev.map(img =>
            img.id === image.id
              ? {
                  ...img,
                  compressed: compressedFile,
                  compressedPreview,
                  compressedSize: compressedFile.size,
                  status: 'done' as const,
                }
              : img
          )
        );
      } catch (error) {
        setImages(prev =>
          prev.map(img =>
            img.id === image.id
              ? {
                  ...img,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Compression failed',
                }
              : img
          )
        );
      }
    }

    setIsCompressing(false);
  }, [images, settings]);

  const downloadImage = useCallback((image: ImageFile) => {
    if (!image.compressed) return;

    const ext = settings.fileType === 'original'
      ? image.file.name.split('.').pop()
      : settings.fileType;
    const baseName = image.file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}_compressed.${ext}`;

    const url = URL.createObjectURL(image.compressed);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [settings.fileType]);

  const downloadAll = useCallback(() => {
    const completedImages = images.filter(img => img.status === 'done' && img.compressed);
    completedImages.forEach(img => downloadImage(img));
  }, [images, downloadImage]);

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = images
    .filter(img => img.compressedSize)
    .reduce((sum, img) => sum + (img.compressedSize || 0), 0);
  const completedCount = images.filter(img => img.status === 'done').length;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3">
            <ImageDown className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            {t('tools.imageCompressor.title')}
          </h1>
          <p className="text-zinc-400">{t('tools.imageCompressor.description')}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <Shield className="h-4 w-4" />
            {t('common.privacyNote')}
          </div>
        </motion.div>

        {/* Settings Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex justify-end"
        >
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <Settings className="h-4 w-4" />
            {lng === 'de' ? 'Einstellungen' : 'Settings'}
          </button>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {lng === 'de' ? 'Max. Größe (MB)' : 'Max Size (MB)'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={settings.maxSizeMB}
                    onChange={(e) => setSettings({ ...settings, maxSizeMB: parseFloat(e.target.value) })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {lng === 'de' ? 'Max. Auflösung (px)' : 'Max Resolution (px)'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4096"
                    step="100"
                    value={settings.maxWidthOrHeight}
                    onChange={(e) => setSettings({ ...settings, maxWidthOrHeight: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {lng === 'de' ? 'Qualität' : 'Quality'} ({Math.round(settings.quality * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={settings.quality}
                    onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {lng === 'de' ? 'Ausgabeformat' : 'Output Format'}
                  </label>
                  <select
                    value={settings.fileType}
                    onChange={(e) => setSettings({ ...settings, fileType: e.target.value as CompressionSettings['fileType'] })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="original">{lng === 'de' ? 'Original' : 'Original'}</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 cursor-pointer rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-12 text-center transition-colors hover:border-emerald-500/50"
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
          <p className="mb-2 text-lg font-medium text-white">
            {lng === 'de' ? 'Bilder hier ablegen' : 'Drop images here'}
          </p>
          <p className="text-sm text-zinc-500">
            {lng === 'de'
              ? 'oder klicken zum Auswählen (JPG, PNG, WebP, GIF)'
              : 'or click to select (JPG, PNG, WebP, GIF)'}
          </p>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm text-zinc-500">{lng === 'de' ? 'Bilder' : 'Images'}</div>
                  <div className="text-lg font-semibold text-white">{images.length}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">{lng === 'de' ? 'Original' : 'Original'}</div>
                  <div className="text-lg font-semibold text-white">{formatBytes(totalOriginalSize)}</div>
                </div>
                {totalCompressedSize > 0 && (
                  <>
                    <ArrowRight className="h-5 w-5 text-zinc-600" />
                    <div>
                      <div className="text-sm text-zinc-500">{lng === 'de' ? 'Komprimiert' : 'Compressed'}</div>
                      <div className="text-lg font-semibold text-emerald-400">{formatBytes(totalCompressedSize)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-500">{lng === 'de' ? 'Ersparnis' : 'Saved'}</div>
                      <div className="text-lg font-semibold text-emerald-400">
                        {calculateSavings(totalOriginalSize, totalCompressedSize)}%
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
                >
                  <Trash2 className="h-4 w-4" />
                  {lng === 'de' ? 'Alle löschen' : 'Clear All'}
                </button>
                {completedCount > 0 && (
                  <button
                    onClick={downloadAll}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
                  >
                    <Download className="h-4 w-4" />
                    {lng === 'de' ? `Alle herunterladen (${completedCount})` : `Download All (${completedCount})`}
                  </button>
                )}
              </div>
            </div>

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
                    className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
                  >
                    {/* Preview */}
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
                        className="absolute left-2 top-2 rounded-full bg-zinc-900/80 p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-zinc-500" />
                        <span className="truncate text-sm text-white">{image.file.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500">{formatBytes(image.originalSize)}</span>
                        {image.compressedSize && (
                          <>
                            <ArrowRight className="h-4 w-4 text-zinc-600" />
                            <span className="text-emerald-400">{formatBytes(image.compressedSize)}</span>
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                              -{calculateSavings(image.originalSize, image.compressedSize)}%
                            </span>
                          </>
                        )}
                      </div>
                      {image.status === 'done' && (
                        <button
                          onClick={() => downloadImage(image)}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
                        >
                          <Download className="h-4 w-4" />
                          {t('common.download')}
                        </button>
                      )}
                      {image.status === 'error' && (
                        <div className="mt-2 text-sm text-red-400">{image.error}</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Compress Button */}
            {images.some(img => img.status === 'pending') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={compressImages}
                  disabled={isCompressing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    <>
                      <ImageDown className="h-5 w-5" />
                      {lng === 'de' ? 'Bilder komprimieren' : 'Compress Images'}
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
