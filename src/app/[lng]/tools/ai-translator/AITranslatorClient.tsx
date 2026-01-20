'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages,
  ArrowRight,
  Upload,
  FileText,
  Copy,
  Download,
  Loader2,
  AlertCircle,
  Check,
  ArrowLeftRight,
  Sparkles,
} from 'lucide-react';
import { Language } from '@/i18n/settings';
import TransparencyTag from '@/components/TransparencyTag';
import AICostPreview from '@/components/AICostPreview';
import SocialShare from '@/components/SocialShare';

interface AITranslatorClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'AI Document Translator',
    subtitle: 'Translate text and documents with AI precision',
    inputLabel: 'Text to translate',
    inputPlaceholder: 'Paste your text here or upload a file...',
    outputLabel: 'Translation',
    outputPlaceholder: 'Translation will appear here...',
    sourceLang: 'Source Language',
    targetLang: 'Target Language',
    autoDetect: 'Auto-detect',
    translate: 'Translate',
    translating: 'Translating...',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    uploadFile: 'Upload file',
    supportedFormats: 'TXT, MD, DOCX, PDF (max 10MB)',
    wordCount: 'words',
    charCount: 'characters',
    estimateCost: 'Estimate Cost',
    error: 'Translation failed',
    tryAgain: 'Try again',
    swapLanguages: 'Swap languages',
    languages: {
      en: 'English',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      hi: 'Hindi',
      tr: 'Turkish',
    },
  },
  de: {
    title: 'KI-Dokumentübersetzer',
    subtitle: 'Texte und Dokumente mit KI-Präzision übersetzen',
    inputLabel: 'Zu übersetzender Text',
    inputPlaceholder: 'Füge deinen Text hier ein oder lade eine Datei hoch...',
    outputLabel: 'Übersetzung',
    outputPlaceholder: 'Die Übersetzung erscheint hier...',
    sourceLang: 'Ausgangssprache',
    targetLang: 'Zielsprache',
    autoDetect: 'Automatisch erkennen',
    translate: 'Übersetzen',
    translating: 'Übersetze...',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    download: 'Herunterladen',
    uploadFile: 'Datei hochladen',
    supportedFormats: 'TXT, MD, DOCX, PDF (max 10MB)',
    wordCount: 'Wörter',
    charCount: 'Zeichen',
    estimateCost: 'Kosten schätzen',
    error: 'Übersetzung fehlgeschlagen',
    tryAgain: 'Erneut versuchen',
    swapLanguages: 'Sprachen tauschen',
    languages: {
      en: 'Englisch',
      de: 'Deutsch',
      fr: 'Französisch',
      es: 'Spanisch',
      it: 'Italienisch',
      pt: 'Portugiesisch',
      nl: 'Niederländisch',
      pl: 'Polnisch',
      ru: 'Russisch',
      zh: 'Chinesisch',
      ja: 'Japanisch',
      ko: 'Koreanisch',
      ar: 'Arabisch',
      hi: 'Hindi',
      tr: 'Türkisch',
    },
  },
};

type LanguageCode = keyof typeof content.en.languages;

export default function AITranslatorClient({ lng }: AITranslatorClientProps) {
  const t = content[lng];

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<LanguageCode | 'auto'>('auto');
  const [targetLang, setTargetLang] = useState<LanguageCode>(lng === 'de' ? 'en' : 'de');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCostPreview, setShowCostPreview] = useState(false);
  const [costEstimate, setCostEstimate] = useState<{
    wordCount: number;
    totalCredits: number;
    estimatedTime: number;
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const estimateCost = async () => {
    if (!inputText.trim()) return;

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
          targetLang,
          estimateOnly: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCostEstimate({
          wordCount: data.wordCount,
          totalCredits: data.totalCredits,
          estimatedTime: data.estimatedTime,
        });
        setShowCostPreview(true);
      }
    } catch {
      setError('Failed to estimate cost');
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setShowCostPreview(false);

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
          targetLang,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Translation failed');
      }

      const data = await response.json();
      setOutputText(data.translation);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsTranslating(false);
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
    a.download = `translation-${targetLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputText, targetLang]);

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (outputText) {
      setInputText(outputText);
      setOutputText('');
    }
  };

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
            <Languages className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">{t.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TransparencyTag type="ai" lng={lng} />
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : `https://puretools.ai/${lng}/tools/ai-translator`}
            title={t.title}
            description={t.subtitle}
          />
        </div>
      </div>

      {/* Language Selection */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            {t.sourceLang}
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as LanguageCode | 'auto')}
            className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="auto">{t.autoDetect}</option>
            {Object.entries(t.languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwapLanguages}
          disabled={sourceLang === 'auto'}
          className="mt-6 rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 text-indigo-600 dark:text-zinc-400 transition-all hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title={t.swapLanguages}
        >
          <ArrowLeftRight className="h-5 w-5" />
        </button>

        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            {t.targetLang}
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
            className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {Object.entries(t.languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="h-64 w-full resize-none rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 text-zinc-800 dark:text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t.outputLabel}</label>
            {outputText && (
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
            )}
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder={t.outputPlaceholder}
            className="h-64 w-full resize-none rounded-xl border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-900 p-4 text-zinc-800 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-600"
          />
        </div>
      </div>

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
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </motion.div>
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
                type="translator"
                wordCount={costEstimate.wordCount}
                creditsRequired={costEstimate.totalCredits}
                estimatedTime={costEstimate.estimatedTime}
                onConfirm={handleTranslate}
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
          disabled={!inputText.trim() || isTranslating}
          className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 font-medium text-indigo-700 dark:text-white transition-all hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="h-5 w-5" />
          {t.estimateCost}
        </button>
        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.translating}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t.translate}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
