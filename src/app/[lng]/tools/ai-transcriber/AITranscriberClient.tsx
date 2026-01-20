'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Upload,
  FileAudio,
  Copy,
  Download,
  Loader2,
  AlertCircle,
  Check,
  Clock,
  Sparkles,
  X,
  Play,
  Pause,
} from 'lucide-react';
import { Language } from '@/i18n/settings';
import TransparencyTag from '@/components/TransparencyTag';
import AICostPreview from '@/components/AICostPreview';
import SocialShare from '@/components/SocialShare';
import AIProgressIndicator from '@/components/AIProgressIndicator';

interface AITranscriberClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'AI Audio Transcriber',
    subtitle: 'Convert speech to text with Whisper AI',
    dropzone: 'Drop audio file here or click to upload',
    dropzoneActive: 'Drop your file here...',
    supportedFormats: 'MP3, WAV, M4A, WebM, MP4, OGG (max 25MB)',
    language: 'Audio Language',
    autoDetect: 'Auto-detect',
    transcribe: 'Transcribe',
    transcribing: 'Transcribing...',
    result: 'Transcription',
    resultPlaceholder: 'Transcription will appear here...',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    downloadSRT: 'Download SRT',
    estimateCost: 'Estimate Cost',
    error: 'Transcription failed',
    fileSelected: 'File selected',
    duration: 'Estimated duration',
    removeFile: 'Remove file',
    preview: 'Preview',
    languages: {
      auto: 'Auto-detect',
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
    },
  },
  de: {
    title: 'KI-Audio-Transkription',
    subtitle: 'Sprache in Text umwandeln mit Whisper AI',
    dropzone: 'Audiodatei hier ablegen oder klicken zum Hochladen',
    dropzoneActive: 'Datei hier ablegen...',
    supportedFormats: 'MP3, WAV, M4A, WebM, MP4, OGG (max 25MB)',
    language: 'Audio-Sprache',
    autoDetect: 'Automatisch erkennen',
    transcribe: 'Transkribieren',
    transcribing: 'Transkribiere...',
    result: 'Transkription',
    resultPlaceholder: 'Die Transkription erscheint hier...',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    download: 'Herunterladen',
    downloadSRT: 'SRT herunterladen',
    estimateCost: 'Kosten schätzen',
    error: 'Transkription fehlgeschlagen',
    fileSelected: 'Datei ausgewählt',
    duration: 'Geschätzte Dauer',
    removeFile: 'Datei entfernen',
    preview: 'Vorschau',
    languages: {
      auto: 'Automatisch erkennen',
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
    },
  },
};

interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export default function AITranscriberClient({ lng }: AITranscriberClientProps) {
  const t = content[lng];

  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('auto');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showCostPreview, setShowCostPreview] = useState(false);
  const [costEstimate, setCostEstimate] = useState<{
    estimatedDuration: number;
    fileSize: number;
    totalCredits: number;
    estimatedTime: number;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const estimatedDuration = file ? Math.ceil(file.size / (16 * 1024)) : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
      setTranscription('');
      setSegments([]);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTranscription('');
      setSegments([]);
      setError(null);
    }
  };

  const estimateCost = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('estimateOnly', 'true');

    try {
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCostEstimate({
          estimatedDuration: data.estimatedDuration,
          fileSize: data.fileSize,
          totalCredits: data.totalCredits,
          estimatedTime: data.estimatedTime,
        });
        setShowCostPreview(true);
      }
    } catch {
      setError('Failed to estimate cost');
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsTranscribing(true);
    setError(null);
    setShowCostPreview(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.text);
      setSegments(data.segments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!transcription) return;
    await navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transcription]);

  const handleDownload = useCallback(() => {
    if (!transcription) return;
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${file?.name || 'audio'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcription, file]);

  const handleDownloadSRT = useCallback(() => {
    if (!segments.length) return;

    const srt = segments
      .map((seg, i) => {
        const startTime = formatSRTTime(seg.start);
        const endTime = formatSRTTime(seg.end);
        return `${i + 1}\n${startTime} --> ${endTime}\n${seg.text}\n`;
      })
      .join('\n');

    const blob = new Blob([srt], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${file?.name || 'audio'}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segments, file]);

  const formatSRTTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 dark:bg-indigo-500/20 p-3">
            <Mic className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">{t.title}</h1>
            <p className="text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TransparencyTag type="ai" lng={lng} />
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : `https://puretools.ai/${lng}/tools/ai-transcriber`}
            title={t.title}
            description={t.subtitle}
          />
        </div>
      </div>

      {/* File Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-800/50 dark:to-zinc-800/50 hover:border-indigo-400 dark:hover:border-zinc-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".mp3,.wav,.m4a,.webm,.mp4,.ogg,audio/*"
          onChange={handleFileSelect}
        />

        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="rounded-xl bg-emerald-500/20 p-3">
                <FileAudio className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-800 dark:text-white">{file.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formatBytes(file.size)} • {t.duration}: ~{formatDuration(estimatedDuration)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setTranscription('');
                  setSegments([]);
                }}
                className="rounded-lg p-2 text-indigo-600 dark:text-zinc-400 hover:bg-indigo-100 dark:hover:bg-zinc-700 hover:text-indigo-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audio Preview */}
            <div className="flex items-center justify-center gap-3">
              <audio
                ref={audioRef}
                src={URL.createObjectURL(file)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="flex items-center gap-2 rounded-lg bg-indigo-100 dark:bg-zinc-700 px-4 py-2 text-sm text-indigo-700 dark:text-white hover:bg-indigo-200 dark:hover:bg-zinc-600"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {t.preview}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-xl bg-indigo-100 dark:bg-zinc-800 p-4">
                <Upload className="h-8 w-8 text-indigo-500 dark:text-zinc-400" />
              </div>
            </div>
            <p className="text-lg font-medium text-zinc-800 dark:text-white">
              {isDragActive ? t.dropzoneActive : t.dropzone}
            </p>
            <p className="text-sm text-zinc-500">{t.supportedFormats}</p>
          </div>
        )}
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
          {t.language}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {Object.entries(t.languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Result */}
      {transcription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t.result}</label>
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
              {segments.length > 0 && (
                <button
                  onClick={handleDownloadSRT}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-indigo-600 dark:text-zinc-400 transition-colors hover:bg-indigo-100 dark:hover:bg-zinc-800 hover:text-indigo-700 dark:hover:text-white"
                >
                  <Clock className="h-3 w-3" />
                  {t.downloadSRT}
                </button>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 dark:border-zinc-700 bg-indigo-50/50 dark:bg-zinc-900 p-4">
            <p className="whitespace-pre-wrap text-zinc-800 dark:text-white">{transcription}</p>
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
        {isTranscribing && (
          <AIProgressIndicator
            lng={lng}
            type="transcriber"
            isProcessing={isTranscribing}
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
                type="transcriber"
                audioDuration={costEstimate.estimatedDuration}
                fileSize={costEstimate.fileSize}
                creditsRequired={costEstimate.totalCredits}
                estimatedTime={costEstimate.estimatedTime}
                onConfirm={handleTranscribe}
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
          disabled={!file || isTranscribing}
          className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 font-medium text-indigo-700 dark:text-white transition-all hover:border-indigo-500 hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="h-5 w-5" />
          {t.estimateCost}
        </button>
        <button
          onClick={handleTranscribe}
          disabled={!file || isTranscribing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.transcribing}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {t.transcribe}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
