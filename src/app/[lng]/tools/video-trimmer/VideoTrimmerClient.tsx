'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Upload,
  Play,
  Pause,
  Download,
  Loader2,
  X,
  Scissors,
  VolumeX,
  Volume2,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface VideoTrimmerClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Video Trimmer & Muter',
    subtitle: 'Trim videos and remove audio locally in your browser. No uploads, 100% private.',
    dropzone: 'Drop a video file here or click to upload',
    dropzoneActive: 'Drop your video here...',
    supported: 'Supports: MP4, WebM, MOV, AVI (max 500MB)',
    loading: 'Loading video editor...',
    processing: 'Processing video...',
    startTime: 'Start',
    endTime: 'End',
    duration: 'Duration',
    muteAudio: 'Remove Audio',
    keepAudio: 'Keep Audio',
    trim: 'Trim Video',
    download: 'Download',
    reset: 'Reset',
    preview: 'Preview',
    outputFormat: 'Output Format',
    features: {
      title: 'Features',
      items: [
        { title: '100% Private', desc: 'All processing happens in your browser' },
        { title: 'Trim Videos', desc: 'Cut out unwanted parts precisely' },
        { title: 'Remove Audio', desc: 'Mute videos with one click' },
        { title: 'No Limits', desc: 'Free unlimited video processing' },
      ],
    },
  },
  de: {
    title: 'Video Trimmer & Muter',
    subtitle: 'Videos schneiden und Ton entfernen - lokal in Ihrem Browser. Keine Uploads, 100% privat.',
    dropzone: 'Video-Datei hier ablegen oder klicken zum Hochladen',
    dropzoneActive: 'Video hier ablegen...',
    supported: 'Unterstützt: MP4, WebM, MOV, AVI (max 500MB)',
    loading: 'Video-Editor wird geladen...',
    processing: 'Video wird verarbeitet...',
    startTime: 'Start',
    endTime: 'Ende',
    duration: 'Dauer',
    muteAudio: 'Ton entfernen',
    keepAudio: 'Ton behalten',
    trim: 'Video schneiden',
    download: 'Herunterladen',
    reset: 'Zurücksetzen',
    preview: 'Vorschau',
    outputFormat: 'Ausgabeformat',
    features: {
      title: 'Funktionen',
      items: [
        { title: '100% Privat', desc: 'Alle Verarbeitung erfolgt in Ihrem Browser' },
        { title: 'Videos schneiden', desc: 'Unerwünschte Teile präzise entfernen' },
        { title: 'Ton entfernen', desc: 'Videos mit einem Klick stumm schalten' },
        { title: 'Keine Limits', desc: 'Kostenlose unbegrenzte Videobearbeitung' },
      ],
    },
  },
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VideoTrimmerClient({ lng }: VideoTrimmerClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [muteAudio, setMuteAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm'>('mp4');

  // Load video when file is selected
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  // Handle video metadata loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleLoadedMetadata = () => {
      const videoDuration = video.duration;
      if (videoDuration && !isNaN(videoDuration) && isFinite(videoDuration)) {
        setDuration(videoDuration);
        setEndTime(videoDuration);
      }
    };

    // Check if metadata is already loaded
    if (video.readyState >= 1 && video.duration) {
      handleLoadedMetadata();
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl]);

  // Handle time updates during playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // Stop playback at end time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    if (currentTime >= endTime && endTime > 0) {
      video.pause();
      setIsPlaying(false);
    }
  }, [currentTime, endTime, isPlaying]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setProcessedUrl(null);
      setStartTime(0);
      setMuteAudio(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setProcessedUrl(null);
      setStartTime(0);
      setMuteAudio(false);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      // Start from startTime if at beginning
      if (video.currentTime < startTime || video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const processVideo = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Dynamically import FFmpeg
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      setIsLoading(true);
      await ffmpeg.load();
      setIsLoading(false);

      // Write input file
      const inputName = 'input' + getExtension(videoFile.name);
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Build FFmpeg command
      const outputName = `output.${outputFormat}`;
      const args: string[] = ['-i', inputName];

      // Add trim parameters
      args.push('-ss', startTime.toString());
      args.push('-t', (endTime - startTime).toString());

      // Add audio options
      if (muteAudio) {
        args.push('-an'); // Remove audio
      } else {
        args.push('-c:a', 'copy'); // Copy audio codec
      }

      // Video codec
      if (outputFormat === 'mp4') {
        args.push('-c:v', 'libx264', '-preset', 'fast');
      } else {
        args.push('-c:v', 'libvpx-vp9');
      }

      args.push(outputName);

      await ffmpeg.exec(args);

      // Read output file
      const data = await ffmpeg.readFile(outputName);
      // Create new Uint8Array to ensure proper ArrayBuffer type
      const uint8Array = new Uint8Array(data as Uint8Array);
      const blob = new Blob([uint8Array], { type: `video/${outputFormat}` });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
    } catch (error) {
      console.error('Video processing error:', error);
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  const getExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? `.${ext}` : '.mp4';
  };

  const downloadVideo = () => {
    if (!processedUrl) return;

    const baseName = videoFile?.name.replace(/\.[^/.]+$/, '') || 'video';
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `${baseName}_trimmed.${outputFormat}`;
    a.click();
  };

  const clearAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setProcessedUrl(null);
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setMuteAudio(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetTrim = () => {
    setStartTime(0);
    setEndTime(duration);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleRangeChange = (type: 'start' | 'end', value: number) => {
    if (type === 'start') {
      setStartTime(Math.min(value, endTime - 1));
      if (videoRef.current) {
        videoRef.current.currentTime = value;
      }
    } else {
      setEndTime(Math.max(value, startTime + 1));
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
          <div className="mb-4 inline-flex rounded-2xl bg-purple-100 dark:bg-purple-500/10 p-4">
            <Film className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Upload / Video Player Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!videoFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-4 h-12 w-12 ${isDragging ? 'text-purple-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
              <p className="mb-2 text-zinc-700 dark:text-zinc-300">
                {isDragging ? t.dropzoneActive : t.dropzone}
              </p>
              <p className="text-sm text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Video Player */}
              <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-black">
                <button
                  onClick={clearAll}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  preload="metadata"
                  playsInline
                  className="w-full max-h-[400px]"
                  onClick={togglePlayPause}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
                      setDuration(video.duration);
                      setEndTime(video.duration);
                    }
                  }}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white" />}
                    </button>
                    <span className="text-sm text-white">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trim Controls */}
              <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
                <div className="space-y-6">
                  {/* Timeline Visual */}
                  <div className="space-y-4">
                    {/* Time Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SkipBack className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {t.startTime}: <span className="text-purple-600 dark:text-purple-400">{formatTime(startTime)}</span>
                        </span>
                      </div>
                      <div className="text-sm text-zinc-500">
                        {t.duration}: {formatTime(Math.max(0, endTime - startTime))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {t.endTime}: <span className="text-purple-600 dark:text-purple-400">{formatTime(endTime)}</span>
                        </span>
                        <SkipForward className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>

                    {/* Visual Timeline Bar */}
                    <div className="relative h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      {/* Selected region highlight */}
                      {duration > 0 && (
                        <div
                          className="absolute top-0 bottom-0 bg-purple-500/30 border-x-2 border-purple-500"
                          style={{
                            left: `${(startTime / duration) * 100}%`,
                            width: `${((endTime - startTime) / duration) * 100}%`,
                          }}
                        />
                      )}
                      {/* Current playhead */}
                      {duration > 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        />
                      )}
                      {/* Time markers */}
                      <div className="absolute bottom-1 left-2 text-xs text-zinc-400">0:00</div>
                      <div className="absolute bottom-1 right-2 text-xs text-zinc-400">{formatTime(duration)}</div>
                    </div>

                    {/* Dual Range Sliders */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Start Time Slider */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          <SkipBack className="h-4 w-4" />
                          {t.startTime}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={startTime}
                            onChange={(e) => handleRangeChange('start', parseFloat(e.target.value))}
                            disabled={duration === 0}
                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <input
                            type="number"
                            min={0}
                            max={Math.max(0, endTime - 0.1)}
                            step={0.1}
                            value={startTime.toFixed(1)}
                            onChange={(e) => handleRangeChange('start', parseFloat(e.target.value) || 0)}
                            disabled={duration === 0}
                            className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-center disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* End Time Slider */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          <SkipForward className="h-4 w-4" />
                          {t.endTime}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={endTime}
                            onChange={(e) => handleRangeChange('end', parseFloat(e.target.value))}
                            disabled={duration === 0}
                            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <input
                            type="number"
                            min={Math.min(duration, startTime + 0.1)}
                            max={duration}
                            step={0.1}
                            value={endTime.toFixed(1)}
                            onChange={(e) => handleRangeChange('end', parseFloat(e.target.value) || duration)}
                            disabled={duration === 0}
                            className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-center disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick trim buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setStartTime(currentTime); }}
                        disabled={duration === 0}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 disabled:opacity-50"
                      >
                        Set Start to Current
                      </button>
                      <button
                        onClick={() => { setEndTime(currentTime); }}
                        disabled={duration === 0}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 disabled:opacity-50"
                      >
                        Set End to Current
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = startTime;
                          }
                        }}
                        disabled={duration === 0}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                      >
                        Jump to Start
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = endTime;
                          }
                        }}
                        disabled={duration === 0}
                        className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                      >
                        Jump to End
                      </button>
                    </div>
                  </div>

                  {/* Options Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => setMuteAudio(!muteAudio)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium transition-colors ${
                        muteAudio
                          ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 ring-2 ring-red-500/50'
                          : 'bg-indigo-100 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 hover:bg-indigo-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {muteAudio ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      {muteAudio ? t.muteAudio : t.keepAudio}
                    </button>
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.outputFormat}:</span>
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value as 'mp4' | 'webm')}
                        className="rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-800 dark:text-white"
                      >
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                      </select>
                    </div>
                    <button
                      onClick={resetTrim}
                      disabled={duration === 0}
                      className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {t.reset}
                    </button>
                  </div>

                  {/* Progress */}
                  {(isLoading || isProcessing) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isLoading ? t.loading : t.processing}
                        </span>
                        {isProcessing && <span className="text-zinc-500">{progress}%</span>}
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-zinc-800">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${isLoading ? 50 : progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {!processedUrl ? (
                      <button
                        onClick={processVideo}
                        disabled={isProcessing || isLoading}
                        className="flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-400 disabled:opacity-50"
                      >
                        <Scissors className="h-5 w-5" />
                        {t.trim}
                      </button>
                    ) : (
                      <button
                        onClick={downloadVideo}
                        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-400"
                      >
                        <Download className="h-5 w-5" />
                        {t.download}
                      </button>
                    )}
                  </div>
                </div>
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
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <Film className="mb-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
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
