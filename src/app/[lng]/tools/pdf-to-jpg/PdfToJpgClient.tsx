'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileImage,
  Upload,
  Download,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  ZoomIn,
  ZoomOut,
  DownloadCloud,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface PdfToJpgClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'PDF to JPG Converter',
    subtitle: 'Convert PDF pages to high-quality images. Perfect for sharing on social media. 100% local processing.',
    dropzone: 'Drop a PDF file here or click to upload',
    dropzoneActive: 'Drop your PDF here...',
    supported: 'Supports: PDF files',
    converting: 'Converting pages...',
    quality: 'Image Quality',
    qualityOptions: {
      low: 'Low (1x)',
      medium: 'Medium (2x)',
      high: 'High (3x)',
    },
    format: 'Output Format',
    page: 'Page',
    of: 'of',
    downloadPage: 'Download Page',
    downloadAll: 'Download All as ZIP',
    clear: 'Clear',
    preview: 'Preview',
    pages: 'pages',
    noPages: 'No pages converted yet',
    features: {
      title: 'Features',
      items: [
        { title: '100% Private', desc: 'All processing happens in your browser' },
        { title: 'High Quality', desc: 'Up to 3x resolution scaling' },
        { title: 'Multiple Formats', desc: 'Export as JPG or PNG' },
        { title: 'Batch Download', desc: 'Download all pages as ZIP' },
      ],
    },
  },
  de: {
    title: 'PDF zu JPG Konverter',
    subtitle: 'Wandeln Sie PDF-Seiten in hochwertige Bilder um. Perfekt zum Teilen auf Social Media. 100% lokale Verarbeitung.',
    dropzone: 'PDF-Datei hier ablegen oder klicken zum Hochladen',
    dropzoneActive: 'PDF hier ablegen...',
    supported: 'Unterstützt: PDF-Dateien',
    converting: 'Konvertiere Seiten...',
    quality: 'Bildqualität',
    qualityOptions: {
      low: 'Niedrig (1x)',
      medium: 'Mittel (2x)',
      high: 'Hoch (3x)',
    },
    format: 'Ausgabeformat',
    page: 'Seite',
    of: 'von',
    downloadPage: 'Seite herunterladen',
    downloadAll: 'Alle als ZIP herunterladen',
    clear: 'Leeren',
    preview: 'Vorschau',
    pages: 'Seiten',
    noPages: 'Noch keine Seiten konvertiert',
    features: {
      title: 'Funktionen',
      items: [
        { title: '100% Privat', desc: 'Alle Verarbeitung erfolgt in Ihrem Browser' },
        { title: 'Hohe Qualität', desc: 'Bis zu 3x Auflösungsskalierung' },
        { title: 'Mehrere Formate', desc: 'Export als JPG oder PNG' },
        { title: 'Stapel-Download', desc: 'Alle Seiten als ZIP herunterladen' },
      ],
    },
  },
};

interface ConvertedPage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
}

export default function PdfToJpgClient({ lng }: PdfToJpgClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [error, setError] = useState<string | null>(null);

  const qualityScale = { low: 1, medium: 2, high: 3 };

  const convertPdf = useCallback(async (file: File) => {
    setIsConverting(true);
    setProgress(0);
    setConvertedPages([]);
    setError(null);

    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker source using unpkg which mirrors npm packages exactly
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      setTotalPages(pdf.numPages);
      const pages: ConvertedPage[] = [];
      const scale = qualityScale[quality];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Create canvas for this page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise;

        // Convert to image
        const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, format === 'jpg' ? 0.92 : undefined);

        // Convert to blob for download
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        pages.push({
          pageNum,
          dataUrl,
          blob,
        });

        setProgress(Math.round((pageNum / pdf.numPages) * 100));
      }

      setConvertedPages(pages);
      setCurrentPage(0);
    } catch (err) {
      console.error('PDF conversion error:', err);
      setError(lng === 'de'
        ? 'Fehler beim Konvertieren der PDF. Bitte versuche es erneut.'
        : 'Error converting PDF. Please try again.');
    } finally {
      setIsConverting(false);
    }
  }, [quality, format]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      convertPdf(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      convertPdf(file);
    }
  };

  const downloadPage = (page: ConvertedPage) => {
    const extension = format === 'jpg' ? 'jpg' : 'png';
    const fileName = `${pdfFile?.name.replace('.pdf', '')}_page_${page.pageNum}.${extension}`;

    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = fileName;
    a.click();
  };

  const downloadAll = async () => {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const extension = format === 'jpg' ? 'jpg' : 'png';
    const baseName = pdfFile?.name.replace('.pdf', '') || 'pdf';

    convertedPages.forEach((page) => {
      zip.file(`${baseName}_page_${page.pageNum}.${extension}`, page.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_images.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPdfFile(null);
    setConvertedPages([]);
    setCurrentPage(0);
    setTotalPages(0);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const goToPage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < convertedPages.length - 1) {
      setCurrentPage(currentPage + 1);
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
          <div className="mb-4 inline-flex rounded-2xl bg-rose-100 dark:bg-rose-500/10 p-4">
            <FileImage className="h-10 w-10 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Settings Bar */}
        {!pdfFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.quality}:</span>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as 'low' | 'medium' | 'high')}
                className="rounded-lg bg-indigo-50 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-800 dark:text-white"
              >
                <option value="low">{t.qualityOptions.low}</option>
                <option value="medium">{t.qualityOptions.medium}</option>
                <option value="high">{t.qualityOptions.high}</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.format}:</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'jpg' | 'png')}
                className="rounded-lg bg-indigo-50 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-800 dark:text-white"
              >
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Upload / Preview Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!pdfFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-rose-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
              <p className="mb-2 text-zinc-700 dark:text-zinc-300">
                {isDragging ? t.dropzoneActive : t.dropzone}
              </p>
              <p className="text-sm text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <div>
                    <p className="font-medium text-zinc-800 dark:text-white">{pdfFile.name}</p>
                    <p className="text-sm text-zinc-500">
                      {totalPages} {t.pages}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {convertedPages.length > 0 && (
                    <button
                      onClick={downloadAll}
                      className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-400"
                    >
                      <DownloadCloud className="h-4 w-4" />
                      {t.downloadAll}
                    </button>
                  )}
                  <button
                    onClick={clearAll}
                    className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Progress */}
              {isConverting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.converting}
                    </span>
                    <span className="text-zinc-500">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Image Preview */}
              {convertedPages.length > 0 && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {/* Navigation */}
                    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
                      <span className="rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
                        {t.page} {currentPage + 1} {t.of} {convertedPages.length}
                      </span>
                      <button
                        onClick={() => downloadPage(convertedPages[currentPage])}
                        className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-white"
                      >
                        <Download className="h-4 w-4" />
                        {t.downloadPage}
                      </button>
                    </div>

                    {/* Image */}
                    <div className="flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4 min-h-[400px]">
                      <img
                        src={convertedPages[currentPage].dataUrl}
                        alt={`Page ${currentPage + 1}`}
                        className="max-h-[500px] w-auto shadow-lg"
                      />
                    </div>

                    {/* Page Navigation */}
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <button
                        onClick={() => goToPage('prev')}
                        disabled={currentPage === 0}
                        className="ml-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <button
                        onClick={() => goToPage('next')}
                        disabled={currentPage === convertedPages.length - 1}
                        className="mr-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {convertedPages.map((page, index) => (
                      <button
                        key={page.pageNum}
                        onClick={() => setCurrentPage(index)}
                        className={`relative flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          currentPage === index
                            ? 'border-rose-500 ring-2 ring-rose-500/30'
                            : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={page.dataUrl}
                          alt={`Thumbnail ${page.pageNum}`}
                          className="h-20 w-auto"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-center text-xs text-white">
                          {page.pageNum}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} className="hidden" />

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
                <FileImage className="mb-2 h-5 w-5 text-rose-600 dark:text-rose-400" />
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
