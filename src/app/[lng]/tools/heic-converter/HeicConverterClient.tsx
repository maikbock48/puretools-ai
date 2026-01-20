'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image,
  Upload,
  Download,
  Trash2,
  Shield,
  X,
  Check,
  Loader2,
  FileImage,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface HeicConverterClientProps {
  lng: Language;
}

interface HeicFile {
  id: string;
  file: File;
  preview?: string;
  converted?: Blob;
  convertedPreview?: string;
  originalSize: number;
  convertedSize?: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
}

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function HeicConverterClient({ lng }: HeicConverterClientProps) {
  const { t } = useTranslation(lng);
  const [files, setFiles] = useState<HeicFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(0.9);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const heicFiles: HeicFile[] = selectedFiles
      .filter(file =>
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif'
      )
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        originalSize: file.size,
        status: 'pending' as const,
      }));

    setFiles(prev => [...prev, ...heicFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const heicFiles: HeicFile[] = droppedFiles
      .filter(file =>
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/heic' ||
        file.type === 'image/heif'
      )
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        originalSize: file.size,
        status: 'pending' as const,
      }));

    setFiles(prev => [...prev, ...heicFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        if (file.preview) URL.revokeObjectURL(file.preview);
        if (file.convertedPreview) URL.revokeObjectURL(file.convertedPreview);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      if (f.convertedPreview) URL.revokeObjectURL(f.convertedPreview);
    });
    setFiles([]);
  }, [files]);

  const convertFiles = useCallback(async () => {
    setIsConverting(true);

    // Dynamically import heic2any
    const heic2any = (await import('heic2any')).default;

    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const file of pendingFiles) {
      setFiles(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, status: 'converting' as const } : f
        )
      );

      try {
        const convertedBlob = await heic2any({
          blob: file.file,
          toType: `image/${outputFormat}`,
          quality: quality,
        });

        const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        const convertedPreview = URL.createObjectURL(resultBlob);

        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? {
                  ...f,
                  converted: resultBlob,
                  convertedPreview,
                  convertedSize: resultBlob.size,
                  status: 'done' as const,
                }
              : f
          )
        );
      } catch (error) {
        setFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Conversion failed',
                }
              : f
          )
        );
      }
    }

    setIsConverting(false);
  }, [files, outputFormat, quality]);

  const downloadFile = useCallback((file: HeicFile) => {
    if (!file.converted) return;

    const baseName = file.file.name.replace(/\.(heic|heif)$/i, '');
    const fileName = `${baseName}.${outputFormat}`;

    const url = URL.createObjectURL(file.converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [outputFormat]);

  const downloadAll = useCallback(() => {
    const completedFiles = files.filter(f => f.status === 'done' && f.converted);
    completedFiles.forEach(f => downloadFile(f));
  }, [files, downloadFile]);

  const completedCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-emerald-100 dark:bg-emerald-500/10 p-3">
            <Image className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t('tools.heicConverter.title')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t('tools.heicConverter.description')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" />
              {t('common.privacyNote')}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-zinc-700 bg-indigo-50 dark:bg-zinc-800 px-4 py-2 text-sm text-indigo-700 dark:text-zinc-400">
              <Smartphone className="h-4 w-4" />
              {lng === 'de' ? 'Perfekt für iPhone Fotos' : 'Perfect for iPhone Photos'}
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-6 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {lng === 'de' ? 'Ausgabeformat:' : 'Output Format:'}
            </label>
            <div className="flex gap-1 rounded-lg bg-indigo-50 dark:bg-zinc-800 p-1">
              {(['jpeg', 'png', 'webp'] as OutputFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setOutputFormat(format)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    outputFormat === format
                      ? 'bg-emerald-500 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {outputFormat !== 'png' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {lng === 'de' ? 'Qualität:' : 'Quality:'} {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-32 accent-emerald-500"
              />
            </div>
          )}
        </motion.div>

        {/* Drop Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 cursor-pointer rounded-2xl border-2 border-dashed border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 p-12 text-center transition-colors hover:border-indigo-400 dark:hover:border-emerald-500/50"
        >
          <Upload className="mx-auto mb-4 h-12 w-12 text-indigo-400 dark:text-zinc-500" />
          <p className="mb-2 text-lg font-medium text-zinc-800 dark:text-white">
            {lng === 'de' ? 'HEIC/HEIF Dateien hier ablegen' : 'Drop HEIC/HEIF files here'}
          </p>
          <p className="text-sm text-zinc-500">
            {lng === 'de'
              ? 'oder klicken zum Auswählen'
              : 'or click to select'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".heic,.heif,image/heic,image/heif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>

        {/* File List */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {files.length} {lng === 'de' ? 'Datei(en)' : 'file(s)'} | {completedCount} {lng === 'de' ? 'konvertiert' : 'converted'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-indigo-50 dark:hover:bg-zinc-700"
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

            {/* File Cards */}
            <div className="space-y-3">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    {/* Preview */}
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-indigo-50 dark:bg-zinc-800">
                      {file.convertedPreview ? (
                        <img
                          src={file.convertedPreview}
                          alt={file.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileImage className="h-6 w-6 text-indigo-400 dark:text-zinc-600" />
                        </div>
                      )}
                      {file.status === 'converting' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-800 dark:text-white">{file.file.name}</span>
                        {file.status === 'done' && (
                          <Check className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                        <span>{formatBytes(file.originalSize)}</span>
                        {file.convertedSize && (
                          <>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-emerald-600 dark:text-emerald-400">{formatBytes(file.convertedSize)}</span>
                          </>
                        )}
                      </div>
                      {file.status === 'error' && (
                        <div className="mt-1 text-sm text-red-500 dark:text-red-400">{file.error}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {file.status === 'done' && (
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1.5 text-sm text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-700"
                        >
                          <Download className="h-4 w-4" />
                          {t('common.download')}
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(file.id)}
                        className="rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500 transition-colors hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Convert Button */}
            {files.some(f => f.status === 'pending') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={convertFiles}
                  disabled={isConverting}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    <>
                      <Image className="h-5 w-5" />
                      {lng === 'de' ? `In ${outputFormat.toUpperCase()} konvertieren` : `Convert to ${outputFormat.toUpperCase()}`}
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
