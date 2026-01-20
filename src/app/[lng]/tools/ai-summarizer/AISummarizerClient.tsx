'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Copy,
  Download,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  List,
  AlignLeft,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { Language } from '@/i18n/settings';
import TransparencyTag from '@/components/TransparencyTag';
import AICostPreview from '@/components/AICostPreview';
import SocialShare from '@/components/SocialShare';
import AIProgressIndicator from '@/components/AIProgressIndicator';

interface AISummarizerClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'AI Text Summarizer',
    subtitle: 'Condense long texts into concise summaries',
    inputLabel: 'Text to summarize',
    inputPlaceholder: 'Paste your text here or upload a file (minimum 100 characters)...',
    outputLabel: 'Summary',
    outputPlaceholder: 'Summary will appear here...',
    summarize: 'Summarize',
    summarizing: 'Summarizing...',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    uploadFile: 'Upload file',
    supportedFormats: 'TXT, MD (max 10MB)',
    wordCount: 'words',
    charCount: 'characters',
    estimateCost: 'Estimate Cost',
    error: 'Summarization failed',
    compression: 'Compression',
    lengthLabel: 'Summary Length',
    styleLabel: 'Summary Style',
    lengths: {
      short: { label: 'Short', desc: '~10% of original' },
      medium: { label: 'Medium', desc: '~25% of original' },
      long: { label: 'Detailed', desc: '~40% of original' },
    },
    styles: {
      bullet: { label: 'Bullet Points', desc: 'Key points as a list', icon: List },
      paragraph: { label: 'Paragraphs', desc: 'Flowing narrative', icon: AlignLeft },
      executive: { label: 'Executive', desc: 'Business format', icon: Briefcase },
    },
  },
  de: {
    title: 'KI-Textzusammenfassung',
    subtitle: 'Lange Texte in prägnante Zusammenfassungen verdichten',
    inputLabel: 'Zu zusammenfassender Text',
    inputPlaceholder: 'Füge deinen Text hier ein oder lade eine Datei hoch (mindestens 100 Zeichen)...',
    outputLabel: 'Zusammenfassung',
    outputPlaceholder: 'Die Zusammenfassung erscheint hier...',
    summarize: 'Zusammenfassen',
    summarizing: 'Fasse zusammen...',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    download: 'Herunterladen',
    uploadFile: 'Datei hochladen',
    supportedFormats: 'TXT, MD (max 10MB)',
    wordCount: 'Wörter',
    charCount: 'Zeichen',
    estimateCost: 'Kosten schätzen',
    error: 'Zusammenfassung fehlgeschlagen',
    compression: 'Komprimierung',
    lengthLabel: 'Zusammenfassungslänge',
    styleLabel: 'Zusammenfassungsstil',
    lengths: {
      short: { label: 'Kurz', desc: '~10% des Originals' },
      medium: { label: 'Mittel', desc: '~25% des Originals' },
      long: { label: 'Ausführlich', desc: '~40% des Originals' },
    },
    styles: {
      bullet: { label: 'Stichpunkte', desc: 'Wichtige Punkte als Liste', icon: List },
      paragraph: { label: 'Absätze', desc: 'Fließende Erzählung', icon: AlignLeft },
      executive: { label: 'Executive', desc: 'Business-Format', icon: Briefcase },
    },
  },
};

type SummaryLength = 'short' | 'medium' | 'long';
type SummaryStyle = 'bullet' | 'paragraph' | 'executive';

export default function AISummarizerClient({ lng }: AISummarizerClientProps) {
  const t = content[lng];

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [style, setStyle] = useState<SummaryStyle>('paragraph');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCostPreview, setShowCostPreview] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [costEstimate, setCostEstimate] = useState<{
    wordCount: number;
    totalCredits: number;
    estimatedTime: number;
    estimatedOutputWords: number;
  } | null>(null);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  const estimateCost = async () => {
    if (!inputText.trim() || inputText.length < 100) return;

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          length,
          style,
          estimateOnly: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCostEstimate({
          wordCount: data.wordCount,
          totalCredits: data.totalCredits,
          estimatedTime: data.estimatedTime,
          estimatedOutputWords: data.estimatedOutputWords,
        });
        setShowCostPreview(true);
      }
    } catch {
      setError('Failed to estimate cost');
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim() || inputText.length < 100) return;

    setIsSummarizing(true);
    setError(null);
    setShowCostPreview(false);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          length,
          style,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Summarization failed');
      }

      const data = await response.json();
      setOutputText(data.summary);
      setCompressionRatio(data.compressionRatio);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputText, length]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB');
      return;
    }

    // Check file type
    const validExtensions = ['.txt', '.md', '.docx', '.pdf'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
      setError('Unsupported file type. Please upload TXT, MD, DOCX, or PDF files.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/ai/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      setInputText(data.text);
      setOutputText('');
      setCompressionRatio(null);
      setUploadedFile({ name: file.name, type: data.fileType });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 dark:bg-indigo-500/20 p-3">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">{t.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TransparencyTag type="ai" lng={lng} />
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : `https://puretools.ai/${lng}/tools/ai-summarizer`}
            title={t.title}
            description={t.subtitle}
          />
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            {t.lengthLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(t.lengths) as [SummaryLength, { label: string; desc: string }][]).map(
              ([key, { label, desc }]) => (
                <button
                  key={key}
                  onClick={() => setLength(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    length === key
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-indigo-200 dark:border-zinc-700 bg-white dark:bg-transparent hover:border-indigo-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className={`block font-medium ${length === key ? 'text-indigo-400' : 'text-zinc-800 dark:text-white'}`}>
                    {label}
                  </span>
                  <span className="text-xs text-zinc-500">{desc}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            {t.styleLabel}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(t.styles) as [SummaryStyle, { label: string; desc: string; icon: typeof List }][]).map(
              ([key, { label, desc, icon: Icon }]) => (
                <button
                  key={key}
                  onClick={() => setStyle(key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    style === key
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-indigo-200 dark:border-zinc-700 bg-white dark:bg-transparent hover:border-indigo-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <Icon className={`h-4 w-4 mb-1 ${style === key ? 'text-indigo-400' : 'text-indigo-500 dark:text-zinc-400'}`} />
                  <span className={`block text-sm font-medium ${style === key ? 'text-indigo-400' : 'text-zinc-800 dark:text-white'}`}>
                    {label}
                  </span>
                  <span className="text-xs text-zinc-500 hidden sm:block">{desc}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t.inputLabel}</label>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{wordCount} {t.wordCount}</span>
            <span>{charCount} {t.charCount}</span>
          </div>
        </div>
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setOutputText('');
              setCompressionRatio(null);
            }}
            placeholder={t.inputPlaceholder}
            className="h-48 w-full resize-none rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-zinc-800 dark:text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <label className={`absolute bottom-3 right-3 cursor-pointer rounded-lg border border-indigo-200 dark:border-zinc-600 bg-indigo-50 dark:bg-zinc-700 px-3 py-1.5 text-xs text-indigo-700 dark:text-zinc-300 transition-colors hover:border-indigo-500 hover:text-indigo-400 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.docx,.pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="mr-1.5 inline h-3 w-3 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-1.5 inline h-3 w-3" />
                {t.uploadFile}
              </>
            )}
          </label>
          {uploadedFile && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400">
              <FileText className="h-3 w-3" />
              <span className="max-w-[150px] truncate">{uploadedFile.name}</span>
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setInputText('');
                  setOutputText('');
                  setCompressionRatio(null);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Output */}
      {outputText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t.outputLabel}</label>
              {compressionRatio !== null && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  {t.compression}: {compressionRatio}%
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {outputWordCount} {t.wordCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-indigo-600 dark:text-zinc-400 transition-colors hover:bg-indigo-100 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? t.copied : t.copy}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-indigo-600 dark:text-zinc-400 transition-colors hover:bg-indigo-100 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-white"
              >
                <Download className="h-3 w-3" />
                {t.download}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-900 p-4">
            <div className="whitespace-pre-wrap text-zinc-800 dark:text-white">{outputText}</div>
          </div>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/70 hover:text-red-400"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <AnimatePresence>
        {isSummarizing && (
          <AIProgressIndicator
            lng={lng}
            type="summarizer"
            isProcessing={isSummarizing}
          />
        )}
      </AnimatePresence>

      {/* Cost Preview Modal */}
      <AnimatePresence>
        {showCostPreview && costEstimate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCostPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AICostPreview
                lng={lng}
                type="summarizer"
                wordCount={costEstimate.wordCount}
                creditsRequired={costEstimate.totalCredits}
                estimatedTime={costEstimate.estimatedTime}
                onConfirm={handleSummarize}
                onCancel={() => setShowCostPreview(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={estimateCost}
          disabled={!inputText.trim() || inputText.length < 100 || isSummarizing}
          className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 font-medium text-indigo-700 dark:text-white transition-all hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-5 w-5" />
          {t.estimateCost}
        </button>
        <button
          onClick={handleSummarize}
          disabled={!inputText.trim() || inputText.length < 100 || isSummarizing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.summarizing}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t.summarize}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
