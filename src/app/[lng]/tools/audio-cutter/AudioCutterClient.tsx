'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  ZoomIn,
  ZoomOut,
  AlertCircle,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface AudioCutterClientProps {
  lng: Language;
}

// Only audio formats - video extraction removed due to Turbopack compatibility
const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/flac', 'audio/webm'];
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.webm'];

const content = {
  en: {
    title: 'Audio Cutter',
    subtitle: 'Trim and cut audio files locally in your browser',
    dropzone: 'Drop an audio file here or click to upload',
    supported: 'Supports: MP3, WAV, OGG, M4A, FLAC, WebM',
    start: 'Start',
    end: 'End',
    duration: 'Selection',
    total: 'Total',
    play: 'Play',
    pause: 'Pause',
    playSelection: 'Play Selection',
    playFromMarker: 'Play from Marker',
    playAll: 'Play All',
    reset: 'Reset',
    download: 'Download',
    processing: 'Processing...',
    zoom: 'Zoom',
    features: {
      title: 'Features',
      items: [
        { title: 'Privacy First', desc: 'All processing happens locally in your browser' },
        { title: 'Multiple Formats', desc: 'Supports MP3, WAV, OGG, M4A, FLAC and more' },
        { title: 'Precise Control', desc: 'Drag handles or use sliders for exact timing' },
        { title: 'No Limits', desc: 'Free unlimited audio processing' },
      ],
    },
    errorModal: {
      title: 'Unsupported Format',
      message: 'The selected file format is not supported. Please use one of the following formats:',
      formats: 'MP3, WAV, OGG, M4A, FLAC, WebM',
      close: 'Got it',
    },
    tips: {
      title: 'Tips',
      items: [
        'Drag the green/red handles to set start and end points',
        'Click on the waveform to set a marker and play from there',
        'Use the sliders below for fine adjustments',
        'Zoom in for more precise editing',
      ],
    },
  },
  de: {
    title: 'Audio Schneider',
    subtitle: 'Audio-Dateien lokal in Ihrem Browser schneiden',
    dropzone: 'Audio-Datei hier ablegen oder klicken zum Hochladen',
    supported: 'Unterstützt: MP3, WAV, OGG, M4A, FLAC, WebM',
    start: 'Start',
    end: 'Ende',
    duration: 'Auswahl',
    total: 'Gesamt',
    play: 'Abspielen',
    pause: 'Pause',
    playSelection: 'Auswahl abspielen',
    playFromMarker: 'Ab Marker',
    playAll: 'Alles abspielen',
    reset: 'Zurücksetzen',
    download: 'Download',
    processing: 'Verarbeite...',
    zoom: 'Zoom',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Datenschutz zuerst', desc: 'Alle Verarbeitung erfolgt lokal in Ihrem Browser' },
        { title: 'Viele Formate', desc: 'Unterstützt MP3, WAV, OGG, M4A, FLAC und mehr' },
        { title: 'Präzise Kontrolle', desc: 'Handles ziehen oder Slider für exaktes Timing' },
        { title: 'Keine Limits', desc: 'Kostenlose unbegrenzte Audio-Verarbeitung' },
      ],
    },
    errorModal: {
      title: 'Format nicht unterstützt',
      message: 'Das ausgewählte Dateiformat wird nicht unterstützt. Bitte verwenden Sie eines der folgenden Formate:',
      formats: 'MP3, WAV, OGG, M4A, FLAC, WebM',
      close: 'Verstanden',
    },
    tips: {
      title: 'Tipps',
      items: [
        'Ziehen Sie die grünen/roten Handles um Start- und Endpunkt zu setzen',
        'Klicken Sie auf die Wellenform um einen Marker zu setzen und ab dort abzuspielen',
        'Nutzen Sie die Slider unten für feine Anpassungen',
        'Zoomen Sie für präziseres Bearbeiten',
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


export default function AudioCutterClient({ lng }: AudioCutterClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'start' | 'end' | 'seek' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Get actual canvas display dimensions
  const getCanvasDisplayWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 800;
    return container.clientWidth - 32; // accounting for padding
  }, []);

  const drawWaveform = useCallback((audioBuffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const displayWidth = getCanvasDisplayWidth();
    const displayHeight = 120;
    canvas.width = displayWidth * zoom;
    canvas.height = displayHeight;

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    // Dark background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform in purple/violet
    ctx.beginPath();
    ctx.strokeStyle = '#a855f7'; // purple-500
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const idx = i * step + j;
        if (idx < data.length) {
          const datum = data[idx];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
      }

      const x = i;
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;

      ctx.moveTo(x, yMin);
      ctx.lineTo(x, yMax);
    }

    ctx.stroke();

    // Draw center line
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(canvas.width, amp);
    ctx.stroke();
  }, [zoom, getCanvasDisplayWidth]);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0 || !audioBufferRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw waveform
    drawWaveform(audioBufferRef.current);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate positions
    const startX = (startTime / duration) * canvasWidth;
    const endX = (endTime / duration) * canvasWidth;
    const currentX = (currentTime / duration) * canvasWidth;

    // Draw non-selected areas (dimmed)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, startX, canvasHeight);
    ctx.fillRect(endX, 0, canvasWidth - endX, canvasHeight);

    // Draw selection highlight (cyan/teal)
    ctx.fillStyle = 'rgba(34, 211, 238, 0.15)'; // cyan-400 with low opacity
    ctx.fillRect(startX, 0, endX - startX, canvasHeight);

    // Draw selection border
    ctx.strokeStyle = '#22d3ee'; // cyan-400
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, 0, endX - startX, canvasHeight);

    // Draw start handle - wider and more visible
    const handleWidth = 12;
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.fillRect(startX - handleWidth / 2, 0, handleWidth, canvasHeight);
    // Handle grip lines (more visible)
    ctx.fillStyle = '#065f46';
    ctx.fillRect(startX - 3, 15, 2, canvasHeight - 30);
    ctx.fillRect(startX + 1, 15, 2, canvasHeight - 30);
    // Drag arrows
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('‹›', startX, canvasHeight / 2 + 5);

    // Draw end handle - wider and more visible
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.fillRect(endX - handleWidth / 2, 0, handleWidth, canvasHeight);
    // Handle grip lines (more visible)
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(endX - 3, 15, 2, canvasHeight - 30);
    ctx.fillRect(endX + 1, 15, 2, canvasHeight - 30);
    // Drag arrows
    ctx.fillStyle = '#ffffff';
    ctx.fillText('‹›', endX, canvasHeight / 2 + 5);

    // Draw current time indicator (playhead) - yellow/gold for visibility
    if (currentTime > 0 && currentTime !== startTime) {
      ctx.fillStyle = '#fbbf24'; // amber-400
      ctx.fillRect(currentX - 1.5, 0, 3, canvasHeight);
      // Triangle at top
      ctx.beginPath();
      ctx.moveTo(currentX - 8, 0);
      ctx.lineTo(currentX + 8, 0);
      ctx.lineTo(currentX, 12);
      ctx.closePath();
      ctx.fill();
      // Triangle at bottom
      ctx.beginPath();
      ctx.moveTo(currentX - 8, canvasHeight);
      ctx.lineTo(currentX + 8, canvasHeight);
      ctx.lineTo(currentX, canvasHeight - 12);
      ctx.closePath();
      ctx.fill();
    }

    // Draw time markers
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px system-ui';
    const markerInterval = duration > 60 ? 10 : duration > 10 ? 1 : 0.5;
    for (let time = 0; time <= duration; time += markerInterval) {
      const x = (time / duration) * canvasWidth;
      ctx.fillRect(x, canvasHeight - 5, 1, 5);
      if (time % (markerInterval * 2) === 0) {
        const label = formatTime(time).split('.')[0];
        ctx.fillText(label, x - 12, canvasHeight - 8);
      }
    }
  }, [duration, startTime, endTime, currentTime, drawWaveform]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const isValidFormat = (file: File): boolean => {
    if (SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
      return true;
    }
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const loadAudio = useCallback(async (file: File) => {
    if (!isValidFormat(file)) {
      setShowErrorModal(true);
      return;
    }

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
      setCurrentTime(0);
      setZoom(1);

      drawWaveform(audioBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  }, [drawWaveform]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadAudio(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadAudio(file);
    }
  };

  const getTimeFromPosition = useCallback((clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return 0;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = x / rect.width;
    return Math.max(0, Math.min(duration, ratio * duration));
  }, [duration]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    // Check if clicking on handles (within 10px)
    const startX = (startTime / duration) * rect.width;
    const endX = (endTime / duration) * rect.width;

    if (Math.abs(x - startX) < 15) {
      setDragType('start');
    } else if (Math.abs(x - endX) < 15) {
      setDragType('end');
    } else if (clickTime >= startTime && clickTime <= endTime) {
      // Seek within selection
      setCurrentTime(clickTime);
      setDragType('seek');
    } else {
      // Click outside selection - set nearest handle
      if (clickTime < startTime) {
        setStartTime(Math.max(0, clickTime));
      } else {
        setEndTime(Math.min(duration, clickTime));
      }
    }
  }, [duration, startTime, endTime]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragType) return;

    const time = getTimeFromPosition(e.clientX);

    if (dragType === 'start') {
      setStartTime(Math.max(0, Math.min(time, endTime - 0.1)));
    } else if (dragType === 'end') {
      setEndTime(Math.max(startTime + 0.1, Math.min(time, duration)));
    } else if (dragType === 'seek') {
      setCurrentTime(Math.max(startTime, Math.min(time, endTime)));
    }
  }, [dragType, getTimeFromPosition, endTime, startTime, duration]);

  const handleMouseUp = useCallback(() => {
    setDragType(null);
  }, []);

  useEffect(() => {
    if (dragType) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragType, handleMouseMove, handleMouseUp]);

  const playAudio = useCallback((playStart?: number, playEnd?: number) => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    const start = playStart ?? startTime;
    const end = playEnd ?? endTime;
    const playDuration = end - start;

    source.start(0, start, playDuration);
    sourceRef.current = source;
    setIsPlaying(true);
    setCurrentTime(start);

    const startRealTime = audioContextRef.current.currentTime;

    const updateTime = () => {
      if (audioContextRef.current && sourceRef.current) {
        const elapsed = audioContextRef.current.currentTime - startRealTime;
        const newTime = start + elapsed;

        if (newTime < end) {
          setCurrentTime(newTime);
          animationRef.current = requestAnimationFrame(updateTime);
        } else {
          setIsPlaying(false);
          setCurrentTime(start);
        }
      }
    };

    animationRef.current = requestAnimationFrame(updateTime);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(start);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startTime, endTime]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // Already stopped
      }
      sourceRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const downloadCutAudio = () => {
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

      const wavBlob = audioBufferToWav(newBuffer);
      const baseName = audioFile?.name.replace(/\.[^/.]+$/, '') || 'audio';

      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_cut.wav`;
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
    const format = 1;
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

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
    setCurrentTime(0);
  };

  const clearAll = () => {
    stopAudio();
    setAudioFile(null);
    audioBufferRef.current = null;
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustTime = (type: 'start' | 'end', delta: number) => {
    if (type === 'start') {
      setStartTime(Math.max(0, Math.min(startTime + delta, endTime - 0.1)));
    } else {
      setEndTime(Math.max(startTime + 0.1, Math.min(endTime + delta, duration)));
    }
  };

  const closeErrorAndReset = () => {
    setShowErrorModal(false);
    clearAll();
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
          <div className="mb-4 inline-flex rounded-2xl bg-pink-100 dark:bg-pink-500/10 p-4">
            <Scissors className="h-10 w-10 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Upload / Editor Area */}
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
                  : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-pink-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
              <p className="mb-2 text-zinc-700 dark:text-zinc-300">{t.dropzone}</p>
              <p className="text-sm text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.ogg,.m4a,.flac,.webm,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div ref={containerRef} className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
              {/* File info header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  <span className="text-sm text-zinc-800 dark:text-white font-medium">{audioFile.name}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {t.total}: {formatTime(duration)}
                  </span>
                </div>
                <button
                  onClick={clearAll}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Loading state */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {t.processing}
                  </span>
                </div>
              )}

              {/* Waveform Editor */}
              {!isProcessing && (
                <>
                  {/* Zoom controls */}
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <span className="text-xs text-zinc-500">{t.zoom}:</span>
                    <button
                      onClick={() => setZoom(Math.max(1, zoom - 0.5))}
                      disabled={zoom <= 1}
                      className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 w-10 text-center">{zoom}x</span>
                    <button
                      onClick={() => setZoom(Math.min(4, zoom + 0.5))}
                      disabled={zoom >= 4}
                      className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Waveform Canvas */}
                  <div className="relative overflow-x-auto rounded-lg bg-zinc-900">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleMouseDown}
                      className="cursor-crosshair"
                      style={{
                        width: `${100 * zoom}%`,
                        height: '120px',
                        cursor: dragType ? 'grabbing' : 'crosshair'
                      }}
                    />
                  </div>

                  {/* Selection info */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-4">
                    {/* Start time control */}
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3 border border-emerald-200 dark:border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <label className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{t.start}</label>
                      </div>
                      <div className="text-lg font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        {formatTime(startTime)}
                      </div>
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={() => adjustTime('start', -0.1)}
                          className="flex-1 p-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-xs"
                        >
                          -0.1s
                        </button>
                        <button
                          onClick={() => adjustTime('start', 0.1)}
                          className="flex-1 p-1 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-xs"
                        >
                          +0.1s
                        </button>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={endTime - 0.1}
                        step={0.01}
                        value={startTime}
                        onChange={(e) => setStartTime(parseFloat(e.target.value))}
                        className="mt-2 w-full h-1.5 rounded-full appearance-none bg-emerald-200 dark:bg-emerald-500/30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>

                    {/* End time control */}
                    <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 border border-red-200 dark:border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <label className="text-xs font-medium text-red-700 dark:text-red-400">{t.end}</label>
                      </div>
                      <div className="text-lg font-mono font-bold text-red-800 dark:text-red-300">
                        {formatTime(endTime)}
                      </div>
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={() => adjustTime('end', -0.1)}
                          className="flex-1 p-1 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 text-xs"
                        >
                          -0.1s
                        </button>
                        <button
                          onClick={() => adjustTime('end', 0.1)}
                          className="flex-1 p-1 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 text-xs"
                        >
                          +0.1s
                        </button>
                      </div>
                      <input
                        type="range"
                        min={startTime + 0.1}
                        max={duration}
                        step={0.01}
                        value={endTime}
                        onChange={(e) => setEndTime(parseFloat(e.target.value))}
                        className="mt-2 w-full h-1.5 rounded-full appearance-none bg-red-200 dark:bg-red-500/30 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>

                    {/* Selection duration */}
                    <div className="rounded-xl bg-cyan-50 dark:bg-cyan-500/10 p-3 border border-cyan-200 dark:border-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Scissors className="w-3 h-3 text-cyan-500" />
                        <label className="text-xs font-medium text-cyan-700 dark:text-cyan-400">{t.duration}</label>
                      </div>
                      <div className="text-lg font-mono font-bold text-cyan-800 dark:text-cyan-300">
                        {formatTime(endTime - startTime)}
                      </div>
                      <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-500">
                        {((endTime - startTime) / duration * 100).toFixed(1)}% {lng === 'de' ? 'vom Original' : 'of original'}
                      </div>
                    </div>

                    {/* Current playback position / Marker */}
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3 border border-amber-200 dark:border-amber-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <label className="text-xs font-medium text-amber-700 dark:text-amber-400">
                          Marker
                        </label>
                      </div>
                      <div className="text-lg font-mono font-bold text-amber-800 dark:text-amber-300">
                        {formatTime(currentTime)}
                      </div>
                      <div className="mt-2">
                        {isPlaying ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {lng === 'de' ? 'Wird abgespielt' : 'Playing'}
                          </span>
                        ) : currentTime > 0 && currentTime !== startTime ? (
                          <button
                            onClick={() => playAudio(currentTime, endTime)}
                            className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                          >
                            <Play className="w-3 h-3" />
                            {t.playFromMarker}
                          </button>
                        ) : (
                          <span className="text-xs text-amber-600/60 dark:text-amber-500/60">
                            {lng === 'de' ? 'Klick auf Waveform' : 'Click waveform'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                    {currentTime > 0 && currentTime !== startTime && !isPlaying && (
                      <button
                        onClick={() => playAudio(currentTime, endTime)}
                        className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-400"
                      >
                        <Play className="h-4 w-4" />
                        {t.playFromMarker}
                      </button>
                    )}
                    <button
                      onClick={() => playAudio(0, duration)}
                      className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-4 py-3 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600"
                    >
                      <Volume2 className="h-4 w-4" />
                      {t.playAll}
                    </button>
                    <button
                      onClick={resetSelection}
                      className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-4 py-3 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t.reset}
                    </button>
                    <button
                      onClick={downloadCutAudio}
                      disabled={isProcessing}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" />
                      {isProcessing ? t.processing : `${t.download} .WAV`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Tips Section */}
        {audioFile && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-indigo-50/50 dark:bg-zinc-900/30 p-4"
          >
            <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">{t.tips.title}</h3>
            <ul className="grid gap-1 sm:grid-cols-2 text-xs text-indigo-700 dark:text-indigo-400">
              {t.tips.items.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <Volume2 className="mb-2 h-5 w-5 text-pink-600 dark:text-pink-400" />
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
            onClick={closeErrorAndReset}
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
                <code className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  {t.errorModal.formats}
                </code>
              </div>
              <button
                onClick={closeErrorAndReset}
                className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-3 font-medium text-white transition-all hover:from-pink-400 hover:to-rose-400"
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
