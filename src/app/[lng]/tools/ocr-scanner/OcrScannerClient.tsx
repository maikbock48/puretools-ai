'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanText,
  Upload,
  Copy,
  Download,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  X,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface OcrScannerClientProps {
  lng: Language;
}

const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp', 'image/gif', 'image/heic', 'image/heif'];
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.heic', '.heif'];

const content = {
  en: {
    title: 'Privacy OCR Scanner',
    subtitle: 'Extract text from images locally in your browser. No uploads, 100% private.',
    dropzone: 'Drop an image here or click to upload',
    supported: 'Supports: PNG, JPG, JPEG, WebP, BMP, GIF, HEIC',
    extracting: 'Extracting text...',
    converting: 'Converting HEIC...',
    progress: 'Progress',
    resultLabel: 'Extracted Text',
    copy: 'Copy Text',
    copied: 'Copied!',
    download: 'Download as TXT',
    clear: 'Clear',
    noText: 'No text found in the image',
    language: 'OCR Language',
    languages: {
      eng: 'English',
      deu: 'German',
      fra: 'French',
      spa: 'Spanish',
      ita: 'Italian',
      por: 'Portuguese',
      nld: 'Dutch',
      pol: 'Polish',
      rus: 'Russian',
      chi_sim: 'Chinese (Simplified)',
      jpn: 'Japanese',
      kor: 'Korean',
      ara: 'Arabic',
    },
    features: {
      title: 'Features',
      items: [
        { title: '100% Private', desc: 'All processing happens in your browser' },
        { title: 'Multi-Language', desc: 'Support for 13+ languages' },
        { title: 'No Account', desc: 'Free to use without registration' },
        { title: 'Offline Ready', desc: 'Works without internet after loading' },
      ],
    },
    errorModal: {
      title: 'Unsupported Format',
      message: 'The selected file format is not supported. Please use one of the following formats:',
      formats: 'PNG, JPG, JPEG, WebP, BMP, GIF, HEIC',
      close: 'Got it',
    },
  },
  de: {
    title: 'Datenschutz OCR Scanner',
    subtitle: 'Extrahieren Sie Text aus Bildern lokal in Ihrem Browser. Keine Uploads, 100% privat.',
    dropzone: 'Bild hier ablegen oder klicken zum Hochladen',
    supported: 'Unterstützt: PNG, JPG, JPEG, WebP, BMP, GIF, HEIC',
    extracting: 'Text wird extrahiert...',
    converting: 'HEIC wird konvertiert...',
    progress: 'Fortschritt',
    resultLabel: 'Extrahierter Text',
    copy: 'Text kopieren',
    copied: 'Kopiert!',
    download: 'Als TXT herunterladen',
    clear: 'Leeren',
    noText: 'Kein Text im Bild gefunden',
    language: 'OCR Sprache',
    languages: {
      eng: 'Englisch',
      deu: 'Deutsch',
      fra: 'Französisch',
      spa: 'Spanisch',
      ita: 'Italienisch',
      por: 'Portugiesisch',
      nld: 'Niederländisch',
      pol: 'Polnisch',
      rus: 'Russisch',
      chi_sim: 'Chinesisch (Vereinfacht)',
      jpn: 'Japanisch',
      kor: 'Koreanisch',
      ara: 'Arabisch',
    },
    features: {
      title: 'Funktionen',
      items: [
        { title: '100% Privat', desc: 'Alle Verarbeitung erfolgt in Ihrem Browser' },
        { title: 'Mehrsprachig', desc: 'Unterstützung für 13+ Sprachen' },
        { title: 'Kein Account', desc: 'Kostenlos ohne Registrierung' },
        { title: 'Offline bereit', desc: 'Funktioniert ohne Internet nach dem Laden' },
      ],
    },
    errorModal: {
      title: 'Format nicht unterstützt',
      message: 'Das ausgewählte Dateiformat wird nicht unterstützt. Bitte verwenden Sie eines der folgenden Formate:',
      formats: 'PNG, JPG, JPEG, WebP, BMP, GIF, HEIC',
      close: 'Verstanden',
    },
  },
};

type OcrLanguage = 'eng' | 'deu' | 'fra' | 'spa' | 'ita' | 'por' | 'nld' | 'pol' | 'rus' | 'chi_sim' | 'jpn' | 'kor' | 'ara';

export default function OcrScannerClient({ lng }: OcrScannerClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>(lng === 'de' ? 'deu' : 'eng');
  const [isDragging, setIsDragging] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const isHeicFile = (file: File): boolean => {
    const extension = file.name.toLowerCase().split('.').pop();
    return extension === 'heic' || extension === 'heif' ||
           file.type === 'image/heic' || file.type === 'image/heif';
  };

  const isValidFormat = (file: File): boolean => {
    // Check by MIME type
    if (SUPPORTED_FORMATS.includes(file.type)) {
      return true;
    }
    // Check by extension (for HEIC files that may not have correct MIME type)
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const processImage = useCallback(async (file: File) => {
    // Validate file format
    if (!isValidFormat(file)) {
      setShowErrorModal(true);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setExtractedText('');
    setImageName(file.name);

    try {
      let imageData: string;

      // Convert HEIC to JPEG first
      if (isHeicFile(file)) {
        setIsConverting(true);
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });

        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(blob);
        });
        setIsConverting(false);
      } else {
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      setImage(imageData);

      const Tesseract = (await import('tesseract.js')).default;

      const result = await Tesseract.recognize(imageData, ocrLanguage, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text.trim());
    } catch (error) {
      console.error('OCR Error:', error);
      setExtractedText('');
    } finally {
      setIsProcessing(false);
      setIsConverting(false);
    }
  }, [ocrLanguage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    // Reset input so same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const copyToClipboard = async () => {
    if (extractedText) {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageName.replace(/\.[^/.]+$/, '')}_text.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setImage(null);
    setImageName('');
    setExtractedText('');
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
          <div className="mb-4 inline-flex rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 p-4">
            <ScanText className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex justify-center"
        >
          <div className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2">
            <Globe className="h-4 w-4 text-indigo-500 dark:text-zinc-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.language}:</span>
            <select
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value as OcrLanguage)}
              className="rounded-lg bg-indigo-50 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-800 dark:text-white"
            >
              {Object.entries(t.languages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!image ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
                }`}
              >
                <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-cyan-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
                <p className="mb-2 text-zinc-700 dark:text-zinc-300">{t.dropzone}</p>
                <p className="text-sm text-zinc-500">{t.supported}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.bmp,.gif,.heic,.heif,image/png,image/jpeg,image/webp,image/bmp,image/gif,image/heic,image/heif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                <button
                  onClick={clearAll}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-indigo-100 dark:bg-zinc-800 p-1 text-indigo-600 dark:text-zinc-400 hover:bg-indigo-200 dark:hover:bg-zinc-700 hover:text-indigo-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative h-72 overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Uploaded"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="mt-2 truncate text-center text-sm text-zinc-500">{imageName}</p>
              </div>
            )}

            {/* Progress */}
            {(isProcessing || isConverting) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-cyan-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isConverting ? t.converting : t.extracting}
                  </span>
                  <span className="text-zinc-500">{isConverting ? '...' : `${progress}%`}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-zinc-800">
                  <div
                    className="h-full bg-cyan-500 transition-all"
                    style={{ width: isConverting ? '50%' : `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Result Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.resultLabel}</label>
              {extractedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1 text-xs text-indigo-700 dark:text-zinc-300 hover:bg-indigo-200 dark:hover:bg-zinc-700"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        {t.copy}
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadText}
                    className="flex items-center gap-1 rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1 text-xs text-indigo-700 dark:text-zinc-300 hover:bg-indigo-200 dark:hover:bg-zinc-700"
                  >
                    <Download className="h-3 w-3" />
                    {t.download}
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={extractedText || (image && !isProcessing ? t.noText : '')}
              readOnly
              className="h-80 w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-950 p-4 text-sm text-zinc-800 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-600 focus:outline-none"
              placeholder={isProcessing ? '' : ''}
            />
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <ImageIcon className="mb-2 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="mb-1 font-medium text-zinc-800 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowErrorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {t.errorModal.title}
                </h3>
              </div>
              <p className="mb-3 text-zinc-600 dark:text-zinc-400">
                {t.errorModal.message}
              </p>
              <div className="mb-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2">
                <code className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  {t.errorModal.formats}
                </code>
              </div>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-medium text-white transition-all hover:from-cyan-400 hover:to-blue-400"
              >
                {t.errorModal.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
