'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scissors,
  Upload,
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  Music,
  X,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface AudioCutterClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Audio Cutter',
    subtitle: 'Trim and cut audio files locally in your browser. No uploads, 100% private.',
    dropzone: 'Drop an audio file here or click to upload',
    supported: 'Supports: MP3, WAV, OGG, M4A, FLAC',
    start: 'Start Time',
    end: 'End Time',
    duration: 'Duration',
    play: 'Play',
    pause: 'Pause',
    playSelection: 'Play Selection',
    reset: 'Reset',
    download: 'Download Cut Audio',
    processing: 'Processing...',
    format: 'Output Format',
    features: {
      title: 'Features',
      items: [
        { title: 'Privacy First', desc: 'All processing happens locally in your browser' },
        { title: 'Waveform View', desc: 'Visual audio waveform for precise cutting' },
        { title: 'Multiple Formats', desc: 'Export as WAV or MP3' },
        { title: 'No Limits', desc: 'Free unlimited audio processing' },
      ],
    },
  },
  de: {
    title: 'Audio Schneider',
    subtitle: 'Audio-Dateien lokal in Ihrem Browser schneiden. Keine Uploads, 100% privat.',
    dropzone: 'Audio-Datei hier ablegen oder klicken zum Hochladen',
    supported: 'Unterstützt: MP3, WAV, OGG, M4A, FLAC',
    start: 'Startzeit',
    end: 'Endzeit',
    duration: 'Dauer',
    play: 'Abspielen',
    pause: 'Pause',
    playSelection: 'Auswahl abspielen',
    reset: 'Zurücksetzen',
    download: 'Geschnittenes Audio herunterladen',
    processing: 'Verarbeite...',
    format: 'Ausgabeformat',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Datenschutz zuerst', desc: 'Alle Verarbeitung erfolgt lokal in Ihrem Browser' },
        { title: 'Wellenform-Ansicht', desc: 'Visuelle Audio-Wellenform für präzises Schneiden' },
        { title: 'Mehrere Formate', desc: 'Export als WAV oder MP3' },
        { title: 'Keine Limits', desc: 'Kostenlose unbegrenzte Audio-Verarbeitung' },
      ],
    },
  },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const [mins, secsAndMs] = parts;
    const [secs, ms] = secsAndMs.split('.');
    return parseInt(mins) * 60 + parseInt(secs) + (parseInt(ms || '0') / 100);
  }
  return 0;
};

export default function AudioCutterClient({ lng }: AudioCutterClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'wav' | 'mp3'>('wav');

  const drawWaveform = useCallback((audioBuffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
  }, []);

  const drawSelection = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !audioBufferRef.current) return;

    // Redraw waveform
    drawWaveform(audioBufferRef.current);

    // Draw selection overlay
    const startX = (startTime / duration) * canvas.width;
    const endX = (endTime / duration) * canvas.width;

    ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.fillRect(startX, 0, endX - startX, canvas.height);

    // Draw selection handles
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(startX - 2, 0, 4, canvas.height);
    ctx.fillRect(endX - 2, 0, 4, canvas.height);

    // Draw current time indicator
    if (isPlaying) {
      const currentX = (currentTime / duration) * canvas.width;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(currentX - 1, 0, 2, canvas.height);
    }
  }, [duration, startTime, endTime, currentTime, isPlaying, drawWaveform]);

  useEffect(() => {
    drawSelection();
  }, [drawSelection]);

  const loadAudio = useCallback(async (file: File) => {
    setAudioFile(file);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;

      setDuration(audioBuffer.duration);
      setStartTime(0);
      setEndTime(audioBuffer.duration);

      drawWaveform(audioBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [drawWaveform]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadAudio(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      loadAudio(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;

    // Set start or end based on which is closer
    const distToStart = Math.abs(clickTime - startTime);
    const distToEnd = Math.abs(clickTime - endTime);

    if (distToStart < distToEnd) {
      setStartTime(Math.max(0, Math.min(clickTime, endTime - 0.1)));
    } else {
      setEndTime(Math.max(startTime + 0.1, Math.min(clickTime, duration)));
    }
  };

  const playAudio = (start?: number, end?: number) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    const playStart = start ?? startTime;
    const playEnd = end ?? endTime;
    const playDuration = playEnd - playStart;

    source.start(0, playStart, playDuration);
    sourceRef.current = source;
    setIsPlaying(true);
    setCurrentTime(playStart);

    const startRealTime = audioContextRef.current.currentTime;

    const updateTime = () => {
      if (audioContextRef.current && sourceRef.current) {
        const elapsed = audioContextRef.current.currentTime - startRealTime;
        const newTime = playStart + elapsed;

        if (newTime < playEnd) {
          setCurrentTime(newTime);
          requestAnimationFrame(updateTime);
        } else {
          setIsPlaying(false);
          setCurrentTime(playStart);
        }
      }
    };

    requestAnimationFrame(updateTime);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(playStart);
    };
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // Already stopped
      }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const downloadCutAudio = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;

    setIsProcessing(true);

    try {
      const sampleRate = audioBufferRef.current.sampleRate;
      const channels = audioBufferRef.current.numberOfChannels;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const length = endSample - startSample;

      const offlineContext = new OfflineAudioContext(channels, length, sampleRate);
      const newBuffer = offlineContext.createBuffer(channels, length, sampleRate);

      for (let channel = 0; channel < channels; channel++) {
        const sourceData = audioBufferRef.current.getChannelData(channel);
        const destData = newBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          destData[i] = sourceData[startSample + i];
        }
      }

      // Convert to WAV
      const wavBlob = audioBufferToWav(newBuffer);

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = audioFile?.name.replace(/\.[^/.]+$/, '') || 'audio';
      a.download = `${baseName}_cut.${outputFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error cutting audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Interleave channels and write samples
    const channels: Float32Array[] = [];
    for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const resetSelection = () => {
    setStartTime(0);
    setEndTime(duration);
  };

  const clearAll = () => {
    stopAudio();
    setAudioFile(null);
    audioBufferRef.current = null;
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-pink-500/10 p-4">
            <Scissors className="h-10 w-10 text-pink-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Upload / Waveform Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          {!audioFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-pink-400' : 'text-zinc-500'}`} />
              <p className="mb-2 text-zinc-300">{t.dropzone}</p>
              <p className="text-sm text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-pink-400" />
                  <span className="text-sm text-white">{audioFile.name}</span>
                  <span className="text-xs text-zinc-500">{formatTime(duration)}</span>
                </div>
                <button
                  onClick={clearAll}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Waveform Canvas */}
              <canvas
                ref={canvasRef}
                width={800}
                height={100}
                onClick={handleCanvasClick}
                className="mb-4 w-full cursor-crosshair rounded-lg"
              />

              {/* Time Controls */}
              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">{t.start}</label>
                  <input
                    type="text"
                    value={formatTime(startTime)}
                    onChange={(e) => setStartTime(parseTime(e.target.value))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">{t.end}</label>
                  <input
                    type="text"
                    value={formatTime(endTime)}
                    onChange={(e) => setEndTime(parseTime(e.target.value))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">{t.duration}</label>
                  <div className="flex h-[38px] items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-400">
                    {formatTime(endTime - startTime)}
                  </div>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => isPlaying ? stopAudio() : playAudio()}
                  className="flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-400"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      {t.pause}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {t.playSelection}
                    </>
                  )}
                </button>
                <button
                  onClick={resetSelection}
                  className="flex items-center gap-2 rounded-xl bg-zinc-700 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-600"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t.reset}
                </button>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2">
                  <span className="text-xs text-zinc-500">{t.format}:</span>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as 'wav' | 'mp3')}
                    className="bg-transparent text-sm text-white"
                  >
                    <option value="wav">WAV</option>
                  </select>
                </div>
                <button
                  onClick={downloadCutAudio}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {isProcessing ? t.processing : t.download}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <Volume2 className="mb-2 h-5 w-5 text-pink-400" />
                <h3 className="mb-1 font-medium text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
