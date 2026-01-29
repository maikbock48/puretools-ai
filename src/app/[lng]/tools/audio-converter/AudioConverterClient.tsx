'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Music, Upload, Download, Loader2, X, FileAudio, Settings } from 'lucide-react';
import { Mp3Encoder } from 'lamejs';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface AudioConverterClientProps {
  lng: Language;
}

interface AudioFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

const SUPPORTED_FORMATS = [
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/webm',
  'audio/mpeg',
];

const BITRATE_OPTIONS = [
  { value: 128, label: '128 kbps', description: 'Good quality, small file' },
  { value: 192, label: '192 kbps', description: 'High quality' },
  { value: 256, label: '256 kbps', description: 'Very high quality' },
  { value: 320, label: '320 kbps', description: 'Maximum quality' },
];

export default function AudioConverterClient({ lng }: AudioConverterClientProps) {
  const { t } = useTranslation(lng);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState(192);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if file type is supported
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.match(/\.(wav|ogg|flac|m4a|aac|webm|mp3)$/i)) {
      setError(lng === 'de'
        ? 'Nicht unterstütztes Format. Bitte WAV, OGG, FLAC, M4A, AAC oder WebM verwenden.'
        : 'Unsupported format. Please use WAV, OGG, FLAC, M4A, AAC, or WebM.');
      return;
    }

    setError(null);
    setConvertedUrl(null);
    setAudioFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  }, [lng]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const convertToMp3 = async () => {
    if (!audioFile) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await audioFile.file.arrayBuffer();
      setProgress(10);

      // Decode audio using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(30);

      // Get audio data
      const numberOfChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;

      // Get channel data
      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

      // Convert Float32Array to Int16Array
      const leftInt16 = floatTo16BitPCM(leftChannel);
      const rightInt16 = floatTo16BitPCM(rightChannel);

      setProgress(50);

      // Create MP3 encoder
      const mp3encoder = new Mp3Encoder(numberOfChannels, sampleRate, bitrate);
      const mp3Data: Int8Array[] = [];

      // Encode in chunks
      const sampleBlockSize = 1152; // Standard MP3 frame size
      const totalBlocks = Math.ceil(length / sampleBlockSize);

      for (let i = 0; i < length; i += sampleBlockSize) {
        const leftChunk = leftInt16.subarray(i, Math.min(i + sampleBlockSize, length));
        const rightChunk = rightInt16.subarray(i, Math.min(i + sampleBlockSize, length));

        let mp3buf: Int8Array;
        if (numberOfChannels === 1) {
          mp3buf = mp3encoder.encodeBuffer(leftChunk);
        } else {
          mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
        }

        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }

        // Update progress
        const currentBlock = Math.floor(i / sampleBlockSize);
        setProgress(50 + Math.round((currentBlock / totalBlocks) * 45));
      }

      // Flush remaining data
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      setProgress(98);

      // Combine all chunks
      const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
      const mp3Array = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of mp3Data) {
        mp3Array.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.length), offset);
        offset += chunk.length;
      }

      // Create blob and URL
      const blob = new Blob([mp3Array], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      setConvertedUrl(url);
      setProgress(100);

      // Clean up audio context
      await audioContext.close();
    } catch (err) {
      console.error('Conversion error:', err);
      setError(lng === 'de'
        ? 'Fehler bei der Konvertierung. Bitte versuchen Sie es erneut.'
        : 'Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Helper function to convert Float32Array to Int16Array
  const floatTo16BitPCM = (input: Float32Array): Int16Array => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  };

  const handleDownload = () => {
    if (!convertedUrl || !audioFile) return;

    const link = document.createElement('a');
    link.href = convertedUrl;
    const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}.mp3`;
    link.click();
  };

  const clearFile = () => {
    setAudioFile(null);
    setConvertedUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
              <Music className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {lng === 'de' ? 'Audio zu MP3 Konverter' : 'Audio to MP3 Converter'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {lng === 'de'
                ? 'Konvertieren Sie WAV, OGG, FLAC und andere Formate zu MP3'
                : 'Convert WAV, OGG, FLAC and other formats to MP3'}
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
            {/* Bitrate Selection */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Settings className="h-4 w-4" />
                {lng === 'de' ? 'MP3 Qualität' : 'MP3 Quality'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BITRATE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBitrate(option.value)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      bitrate === option.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {lng === 'de'
                        ? option.description.replace('Good quality, small file', 'Gute Qualität')
                            .replace('High quality', 'Hohe Qualität')
                            .replace('Very high quality', 'Sehr hohe Qualität')
                            .replace('Maximum quality', 'Maximum')
                        : option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            {!audioFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 text-center cursor-pointer transition-colors hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.wav,.ogg,.flac,.m4a,.aac,.webm,.mp3"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <Upload className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                  {lng === 'de'
                    ? 'Audiodatei hierher ziehen oder klicken'
                    : 'Drag & drop audio file here or click'}
                </p>
                <p className="text-sm text-zinc-500">
                  WAV, OGG, FLAC, M4A, AAC, WebM
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <FileAudio className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white truncate">
                      {audioFile.name}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {formatFileSize(audioFile.size)}
                    </p>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-zinc-500" />
                  </button>
                </div>

                {/* Progress Bar */}
                {isConverting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {lng === 'de' ? 'Konvertiere...' : 'Converting...'}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!convertedUrl ? (
                    <button
                      onClick={convertToMp3}
                      disabled={isConverting}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          {lng === 'de' ? 'Konvertiere...' : 'Converting...'}
                        </>
                      ) : (
                        <>
                          <Music className="h-5 w-5" />
                          {lng === 'de' ? 'Zu MP3 konvertieren' : 'Convert to MP3'}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleDownload}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      {lng === 'de' ? 'MP3 herunterladen' : 'Download MP3'}
                    </button>
                  )}
                </div>

                {/* Success Message */}
                {convertedUrl && (
                  <div className="text-center text-emerald-600 dark:text-emerald-400 text-sm">
                    {lng === 'de'
                      ? 'Konvertierung abgeschlossen!'
                      : 'Conversion complete!'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('common.privacyNote')}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
