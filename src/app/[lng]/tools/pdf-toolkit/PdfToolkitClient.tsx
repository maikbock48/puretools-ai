'use client';

import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Shield,
  GripVertical,
  Merge,
  Split,
  Loader2,
  File,
  X,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface PdfToolkitClientProps {
  lng: Language;
}

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

type Mode = 'merge' | 'split';

export default function PdfToolkitClient({ lng }: PdfToolkitClientProps) {
  const { t } = useTranslation(lng);
  const [mode, setMode] = useState<Mode>('merge');
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [splitFile, setSplitFile] = useState<PdfFile | null>(null);
  const [splitRange, setSplitRange] = useState({ from: 1, to: 1 });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadPdfPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      return pdf.getPageCount();
    } catch {
      return 0;
    }
  };

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');

    if (mode === 'merge') {
      const newFiles: PdfFile[] = await Promise.all(
        pdfFiles.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          pageCount: await loadPdfPageCount(file),
        }))
      );
      setFiles(prev => [...prev, ...newFiles]);
    } else if (pdfFiles.length > 0) {
      const file = pdfFiles[0];
      const pageCount = await loadPdfPageCount(file);
      setSplitFile({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        pageCount,
      });
      setSplitRange({ from: 1, to: pageCount });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [mode]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(f => f.type === 'application/pdf');

    if (mode === 'merge') {
      const newFiles: PdfFile[] = await Promise.all(
        pdfFiles.map(async (file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          pageCount: await loadPdfPageCount(file),
        }))
      );
      setFiles(prev => [...prev, ...newFiles]);
    } else if (pdfFiles.length > 0) {
      const file = pdfFiles[0];
      const pageCount = await loadPdfPageCount(file);
      setSplitFile({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        pageCount,
      });
      setSplitRange({ from: 1, to: pageCount });
    }
  }, [mode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setSplitFile(null);
  }, []);

  const mergePdfs = useCallback(async () => {
    if (files.length < 2) return;

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Merge failed:', error);
    }

    setIsProcessing(false);
  }, [files]);

  const splitPdf = useCallback(async () => {
    if (!splitFile || !splitFile.pageCount) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await splitFile.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      const newPdf = await PDFDocument.create();
      const pageIndices = [];

      for (let i = splitRange.from - 1; i < splitRange.to; i++) {
        pageIndices.push(i);
      }

      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const splitPdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(splitPdfBytes)], { type: 'application/pdf' });

      const baseName = splitFile.name.replace(/\.pdf$/i, '');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}_pages_${splitRange.from}-${splitRange.to}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Split failed:', error);
    }

    setIsProcessing(false);
  }, [splitFile, splitRange]);

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-emerald-100 dark:bg-emerald-500/10 p-3">
            <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t('tools.pdfToolkit.title')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t('tools.pdfToolkit.description')}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400">
            <Shield className="h-4 w-4" />
            {t('common.privacyNote')}
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex justify-center"
        >
          <div className="inline-flex rounded-xl bg-white dark:bg-zinc-900 p-1 border border-indigo-200 dark:border-zinc-800">
            <button
              onClick={() => { setMode('merge'); clearAll(); }}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                mode === 'merge'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
              }`}
            >
              <Merge className="h-4 w-4" />
              {lng === 'de' ? 'PDFs zusammenführen' : 'Merge PDFs'}
            </button>
            <button
              onClick={() => { setMode('split'); clearAll(); }}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                mode === 'split'
                  ? 'bg-emerald-500 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white'
              }`}
            >
              <Split className="h-4 w-4" />
              {lng === 'de' ? 'PDF teilen' : 'Split PDF'}
            </button>
          </div>
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
            {mode === 'merge'
              ? lng === 'de' ? 'PDF-Dateien hier ablegen' : 'Drop PDF files here'
              : lng === 'de' ? 'PDF-Datei hier ablegen' : 'Drop PDF file here'}
          </p>
          <p className="text-sm text-zinc-500">
            {lng === 'de' ? 'oder klicken zum Auswählen' : 'or click to select'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={mode === 'merge'}
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>

        {/* Merge Mode */}
        {mode === 'merge' && files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Stats */}
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {files.length} {lng === 'de' ? 'Dateien' : 'files'} | {totalPages} {lng === 'de' ? 'Seiten' : 'pages'}
              </div>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
                {lng === 'de' ? 'Alle löschen' : 'Clear All'}
              </button>
            </div>

            {/* Sortable List */}
            <div className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="p-3 border-b border-indigo-100 dark:border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                {lng === 'de' ? 'Reihenfolge durch Ziehen ändern' : 'Drag to reorder'}
              </div>
              <Reorder.Group axis="y" values={files} onReorder={setFiles} className="divide-y divide-indigo-100 dark:divide-zinc-800">
                {files.map((file) => (
                  <Reorder.Item
                    key={file.id}
                    value={file}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                    <File className="h-8 w-8 text-red-500 dark:text-red-400" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-800 dark:text-white">{file.name}</div>
                      <div className="text-xs text-zinc-500">
                        {formatBytes(file.size)} | {file.pageCount} {lng === 'de' ? 'Seiten' : 'pages'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>

            {/* Merge Button */}
            {files.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={mergePdfs}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('common.processing')}
                    </>
                  ) : (
                    <>
                      <Merge className="h-5 w-5" />
                      {lng === 'de' ? 'PDFs zusammenführen' : 'Merge PDFs'}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Split Mode */}
        {mode === 'split' && splitFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* File Info */}
            <div className="flex items-center gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <File className="h-10 w-10 text-red-500 dark:text-red-400" />
              <div className="flex-1">
                <div className="font-medium text-zinc-800 dark:text-white">{splitFile.name}</div>
                <div className="text-sm text-zinc-500">
                  {formatBytes(splitFile.size)} | {splitFile.pageCount} {lng === 'de' ? 'Seiten' : 'pages'}
                </div>
              </div>
              <button
                onClick={() => setSplitFile(null)}
                className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Page Range */}
            <div className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="mb-4 font-medium text-zinc-800 dark:text-white">
                {lng === 'de' ? 'Seitenbereich auswählen' : 'Select Page Range'}
              </h3>
              <div className="flex items-center gap-4">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    {lng === 'de' ? 'Von Seite' : 'From Page'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={splitFile.pageCount}
                    value={splitRange.from}
                    onChange={(e) => setSplitRange(prev => ({
                      ...prev,
                      from: Math.max(1, Math.min(parseInt(e.target.value) || 1, prev.to))
                    }))}
                    className="w-24 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-800 px-3 py-2 text-zinc-800 dark:text-white focus:border-indigo-500 dark:focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <ChevronRight className="mt-5 h-5 w-5 text-zinc-400 dark:text-zinc-600" />
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">
                    {lng === 'de' ? 'Bis Seite' : 'To Page'}
                  </label>
                  <input
                    type="number"
                    min={splitRange.from}
                    max={splitFile.pageCount}
                    value={splitRange.to}
                    onChange={(e) => setSplitRange(prev => ({
                      ...prev,
                      to: Math.max(prev.from, Math.min(parseInt(e.target.value) || 1, splitFile.pageCount || 1))
                    }))}
                    className="w-24 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-800 px-3 py-2 text-zinc-800 dark:text-white focus:border-indigo-500 dark:focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="ml-4 text-sm text-zinc-500">
                  = {splitRange.to - splitRange.from + 1} {lng === 'de' ? 'Seite(n)' : 'page(s)'}
                </div>
              </div>

              {/* Quick presets */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSplitRange({ from: 1, to: splitFile.pageCount || 1 })}
                  className="rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-indigo-700 dark:text-zinc-400 hover:bg-indigo-200 dark:hover:bg-zinc-700 hover:text-indigo-800 dark:hover:text-white"
                >
                  {lng === 'de' ? 'Alle Seiten' : 'All Pages'}
                </button>
                <button
                  onClick={() => setSplitRange({ from: 1, to: 1 })}
                  className="rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-indigo-700 dark:text-zinc-400 hover:bg-indigo-200 dark:hover:bg-zinc-700 hover:text-indigo-800 dark:hover:text-white"
                >
                  {lng === 'de' ? 'Erste Seite' : 'First Page'}
                </button>
                <button
                  onClick={() => setSplitRange({ from: splitFile.pageCount || 1, to: splitFile.pageCount || 1 })}
                  className="rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-indigo-700 dark:text-zinc-400 hover:bg-indigo-200 dark:hover:bg-zinc-700 hover:text-indigo-800 dark:hover:text-white"
                >
                  {lng === 'de' ? 'Letzte Seite' : 'Last Page'}
                </button>
                {(splitFile.pageCount || 0) > 1 && (
                  <button
                    onClick={() => setSplitRange({ from: 1, to: Math.ceil((splitFile.pageCount || 1) / 2) })}
                    className="rounded-lg bg-indigo-100 dark:bg-zinc-800 px-3 py-1.5 text-xs text-indigo-700 dark:text-zinc-400 hover:bg-indigo-200 dark:hover:bg-zinc-700 hover:text-indigo-800 dark:hover:text-white"
                  >
                    {lng === 'de' ? 'Erste Hälfte' : 'First Half'}
                  </button>
                )}
              </div>
            </div>

            {/* Split Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <button
                onClick={splitPdf}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    {lng === 'de' ? 'Seiten extrahieren' : 'Extract Pages'}
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
