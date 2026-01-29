'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic2,
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  VolumeX,
  Settings2,
  Sparkles,
  CreditCard,
  AlertCircle,
  Check,
  User,
  Gauge,
  FileAudio,
  Clock,
  AudioWaveform,
  RotateCcw,
  ChevronDown,
  Info,
  Zap,
  Star,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';
import { useHistory } from '@/hooks/useHistory';

interface AIVoiceGeneratorClientProps {
  lng: Language;
}

type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
type ModelId = 'tts-1' | 'tts-1-hd';
type OutputFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';

interface VoiceInfo {
  id: VoiceId;
  name: string;
  description: { en: string; de: string };
  gender: 'male' | 'female' | 'neutral';
  tags: { en: string[]; de: string[] };
  color: string;
}

const VOICES: VoiceInfo[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    description: { en: 'Neutral & balanced, versatile for any content', de: 'Neutral & ausgewogen, vielseitig für alle Inhalte' },
    gender: 'neutral',
    tags: { en: ['Versatile', 'Professional'], de: ['Vielseitig', 'Professionell'] },
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 'echo',
    name: 'Echo',
    description: { en: 'Warm & conversational, great for storytelling', de: 'Warm & gesprächig, ideal für Geschichten' },
    gender: 'male',
    tags: { en: ['Warm', 'Narrative'], de: ['Warm', 'Erzählend'] },
    color: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'fable',
    name: 'Fable',
    description: { en: 'Expressive & dramatic, perfect for performances', de: 'Ausdrucksvoll & dramatisch, perfekt für Aufführungen' },
    gender: 'neutral',
    tags: { en: ['Dramatic', 'Expressive'], de: ['Dramatisch', 'Ausdrucksvoll'] },
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'onyx',
    name: 'Onyx',
    description: { en: 'Deep & authoritative, ideal for announcements', de: 'Tief & autoritär, ideal für Ansagen' },
    gender: 'male',
    tags: { en: ['Deep', 'Authoritative'], de: ['Tief', 'Autoritär'] },
    color: 'from-slate-600 to-zinc-700',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: { en: 'Friendly & upbeat, engaging for marketing', de: 'Freundlich & lebhaft, packend für Marketing' },
    gender: 'female',
    tags: { en: ['Friendly', 'Energetic'], de: ['Freundlich', 'Energisch'] },
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: { en: 'Clear & pleasant, excellent for education', de: 'Klar & angenehm, exzellent für Bildung' },
    gender: 'female',
    tags: { en: ['Clear', 'Soothing'], de: ['Klar', 'Beruhigend'] },
    color: 'from-emerald-500 to-teal-600',
  },
];

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5x', desc: { en: 'Very Slow', de: 'Sehr langsam' } },
  { value: 0.75, label: '0.75x', desc: { en: 'Slow', de: 'Langsam' } },
  { value: 1.0, label: '1x', desc: { en: 'Normal', de: 'Normal' } },
  { value: 1.25, label: '1.25x', desc: { en: 'Fast', de: 'Schnell' } },
  { value: 1.5, label: '1.5x', desc: { en: 'Very Fast', de: 'Sehr schnell' } },
  { value: 2.0, label: '2x', desc: { en: 'Double', de: 'Doppelt' } },
];

const OUTPUT_FORMATS: { id: OutputFormat; label: string; desc: { en: string; de: string }; recommended?: boolean }[] = [
  { id: 'mp3', label: 'MP3', desc: { en: 'Best compatibility', de: 'Beste Kompatibilität' }, recommended: true },
  { id: 'wav', label: 'WAV', desc: { en: 'Lossless quality', de: 'Verlustfreie Qualität' } },
  { id: 'flac', label: 'FLAC', desc: { en: 'Lossless compressed', de: 'Verlustfrei komprimiert' } },
  { id: 'aac', label: 'AAC', desc: { en: 'Apple devices', de: 'Apple Geräte' } },
  { id: 'opus', label: 'Opus', desc: { en: 'Web optimized', de: 'Web-optimiert' } },
];

const content = {
  en: {
    title: 'AI Voice Generator',
    subtitle: 'Transform text into natural, human-like speech with AI',
    textLabel: 'Enter your text',
    textPlaceholder: 'Type or paste your text here. Our AI will convert it to natural-sounding speech with the voice and settings you choose...',
    voiceLabel: 'Select Voice',
    voicePreview: 'Preview',
    modelLabel: 'Audio Quality',
    modelStandard: 'Standard',
    modelStandardDesc: 'Fast generation, good quality',
    modelHD: 'HD',
    modelHDDesc: 'Premium quality, natural sound',
    speedLabel: 'Speech Speed',
    formatLabel: 'Output Format',
    advancedSettings: 'Advanced Settings',
    generate: 'Generate Speech',
    generating: 'Generating...',
    regenerate: 'Regenerate',
    download: 'Download',
    credits: 'Credits',
    characters: 'characters',
    estimatedDuration: 'Est. duration',
    seconds: 'sec',
    costPreview: 'Cost Preview',
    totalCost: 'Total Cost',
    signInRequired: 'Sign in to generate speech',
    signIn: 'Sign In',
    insufficientCredits: 'Insufficient credits',
    buyCredits: 'Buy Credits',
    error: 'Generation failed. Please try again.',
    loadingPreview: 'Loading preview...',
    playing: 'Playing',
    paused: 'Paused',
    tips: {
      title: 'Tips for best results',
      items: [
        'Use punctuation for natural pauses and emphasis',
        'Add commas for short pauses, periods for longer ones',
        'Use "..." for dramatic pauses',
        'CAPS can add emphasis (use sparingly)',
        'Numbers are read naturally (e.g., 2024)',
      ],
    },
    useCases: {
      title: 'Perfect for',
      items: ['Podcasts', 'Videos', 'Audiobooks', 'E-Learning', 'Announcements', 'Accessibility'],
    },
  },
  de: {
    title: 'KI Stimmen Generator',
    subtitle: 'Verwandeln Sie Text in natürliche, menschenähnliche Sprache mit KI',
    textLabel: 'Geben Sie Ihren Text ein',
    textPlaceholder: 'Tippen oder fügen Sie Ihren Text hier ein. Unsere KI wandelt ihn in natürlich klingende Sprache mit der gewählten Stimme und Einstellungen um...',
    voiceLabel: 'Stimme wählen',
    voicePreview: 'Anhören',
    modelLabel: 'Audioqualität',
    modelStandard: 'Standard',
    modelStandardDesc: 'Schnelle Generierung, gute Qualität',
    modelHD: 'HD',
    modelHDDesc: 'Premiumqualität, natürlicher Klang',
    speedLabel: 'Sprechgeschwindigkeit',
    formatLabel: 'Ausgabeformat',
    advancedSettings: 'Erweiterte Einstellungen',
    generate: 'Sprache generieren',
    generating: 'Generiere...',
    regenerate: 'Neu generieren',
    download: 'Herunterladen',
    credits: 'Credits',
    characters: 'Zeichen',
    estimatedDuration: 'Geschätzte Dauer',
    seconds: 'Sek',
    costPreview: 'Kostenvorschau',
    totalCost: 'Gesamtkosten',
    signInRequired: 'Anmelden um Sprache zu generieren',
    signIn: 'Anmelden',
    insufficientCredits: 'Nicht genügend Credits',
    buyCredits: 'Credits kaufen',
    error: 'Generierung fehlgeschlagen. Bitte erneut versuchen.',
    loadingPreview: 'Lade Vorschau...',
    playing: 'Spielt ab',
    paused: 'Pausiert',
    tips: {
      title: 'Tipps für beste Ergebnisse',
      items: [
        'Verwenden Sie Satzzeichen für natürliche Pausen',
        'Kommas für kurze Pausen, Punkte für längere',
        'Verwenden Sie "..." für dramatische Pausen',
        'GROSSBUCHSTABEN können Betonung hinzufügen',
        'Zahlen werden natürlich gelesen (z.B. 2024)',
      ],
    },
    useCases: {
      title: 'Perfekt für',
      items: ['Podcasts', 'Videos', 'Hörbücher', 'E-Learning', 'Ansagen', 'Barrierefreiheit'],
    },
  },
};

export default function AIVoiceGeneratorClient({ lng }: AIVoiceGeneratorClientProps) {
  const t = content[lng];
  const { data: session, status } = useSession();
  const { saveToHistory } = useHistory();

  // State
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('nova');
  const [model, setModel] = useState<ModelId>('tts-1-hd');
  const [speed, setSpeed] = useState(1.0);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedMimeType, setGeneratedMimeType] = useState<string>('audio/mpeg');
  const [error, setError] = useState<string | null>(null);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);

  // Preview state
  const [previewingVoice, setPreviewingVoice] = useState<VoiceId | null>(null);
  const [previewAudio, setPreviewAudio] = useState<{ [key in VoiceId]?: string }>({});

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const characterCount = text.length;
  const maxCharacters = 4096;

  // Calculate estimated cost
  const estimatedCredits = Math.max(1, Math.ceil((characterCount / 1000) * (model === 'tts-1-hd' ? 4 : 2) * 1.1));
  const estimatedDuration = Math.ceil((characterCount / 5 / 150) * 60); // rough estimate

  // Preview voice
  const previewVoice = useCallback(async (voiceId: VoiceId) => {
    if (previewingVoice) return;

    // Check if we already have this preview cached
    if (previewAudio[voiceId]) {
      if (previewAudioRef.current) {
        previewAudioRef.current.src = previewAudio[voiceId]!;
        previewAudioRef.current.play();
      }
      return;
    }

    setPreviewingVoice(voiceId);

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPreview: true,
          voice: voiceId,
          model: 'tts-1',
          previewLanguage: lng,
        }),
      });

      if (!response.ok) throw new Error('Preview failed');

      const data = await response.json();
      const audioUrl = `data:${data.mimeType};base64,${data.audioData}`;

      setPreviewAudio((prev) => ({ ...prev, [voiceId]: audioUrl }));

      if (previewAudioRef.current) {
        previewAudioRef.current.src = audioUrl;
        previewAudioRef.current.play();
      }
    } catch {
      console.error('Preview failed');
    } finally {
      setPreviewingVoice(null);
    }
  }, [previewingVoice, previewAudio, lng]);

  // Generate speech
  const generateSpeech = useCallback(async () => {
    if (!text.trim() || text.length < 2) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          model,
          speed,
          responseFormat: outputFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError(t.insufficientCredits);
        } else {
          setError(data.error || t.error);
        }
        return;
      }

      const audioUrl = `data:${data.mimeType};base64,${data.audioData}`;
      setGeneratedAudio(audioUrl);
      setGeneratedMimeType(data.mimeType);
      setCreditsUsed(data.creditsUsed);

      // Save to history
      saveToHistory({
        toolType: 'ai-voice-generator',
        title: text.length > 40 ? `${text.substring(0, 40)}...` : text,
        inputData: {
          textLength: text.length,
          voice: selectedVoice,
          model,
          speed,
          format: outputFormat,
        },
        outputData: {
          creditsUsed: data.creditsUsed,
          estimatedDuration: data.estimatedDuration,
        },
      });
    } catch {
      setError(t.error);
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoice, model, speed, outputFormat, t, saveToHistory]);

  // Audio player controls
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !generatedAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, generatedAudio]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Download
  const downloadAudio = useCallback(() => {
    if (!generatedAudio) return;

    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `puretools-voice-${selectedVoice}-${Date.now()}.${outputFormat}`;
    link.click();
  }, [generatedAudio, selectedVoice, outputFormat]);

  // Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset audio on new generation
  useEffect(() => {
    if (generatedAudio && audioRef.current) {
      audioRef.current.src = generatedAudio;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [generatedAudio]);

  const isAuthenticated = status === 'authenticated';
  const canGenerate = isAuthenticated && text.trim().length >= 2 && !isGenerating;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10 p-4">
            <Mic2 className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* Use Cases Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {t.useCases.items.map((useCase, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-xs text-violet-700 dark:text-violet-400"
              >
                <Check className="h-3 w-3" />
                {useCase}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main Panel - Text Input & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Text Input */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t.textLabel}
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`${characterCount > maxCharacters ? 'text-red-500' : 'text-zinc-500'}`}>
                    {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()} {t.characters}
                  </span>
                  {characterCount > 0 && (
                    <span className="text-zinc-400">
                      ~{estimatedDuration} {t.seconds}
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.textPlaceholder}
                maxLength={maxCharacters}
                rows={8}
                className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-violet-500 dark:focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
              />

              {/* Quick Stats */}
              {characterCount > 0 && (
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t.estimatedDuration}: ~{estimatedDuration}s
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    ~{estimatedCredits} {t.credits}
                  </span>
                </div>
              )}
            </div>

            {/* Voice Selection */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t.voiceLabel}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VOICES.map((voice) => (
                  <motion.button
                    key={voice.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`relative rounded-xl border p-4 text-left transition-all ${
                      selectedVoice === voice.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-1 ring-violet-500'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {/* Voice Avatar */}
                    <div className={`mb-2 h-10 w-10 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{voice.name[0]}</span>
                    </div>

                    <div className="font-medium text-zinc-800 dark:text-white text-sm">
                      {voice.name}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {voice.description[lng]}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {voice.tags[lng].map((tag, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Gender Icon */}
                    <div className="absolute top-3 right-3 text-xs text-zinc-400">
                      {voice.gender === 'male' && '♂'}
                      {voice.gender === 'female' && '♀'}
                      {voice.gender === 'neutral' && '◎'}
                    </div>

                    {/* Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(voice.id);
                      }}
                      disabled={previewingVoice === voice.id}
                      className="absolute bottom-3 right-3 rounded-full bg-violet-500 p-1.5 text-white hover:bg-violet-400 disabled:opacity-50 transition-colors"
                    >
                      {previewingVoice === voice.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </button>

                    {/* Selected Indicator */}
                    {selectedVoice === voice.id && (
                      <div className="absolute top-3 left-3 rounded-full bg-violet-500 p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Model Quality Selection */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t.modelLabel}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setModel('tts-1')}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    model === 'tts-1'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-4 w-4 text-zinc-500" />
                    <span className="font-medium text-zinc-800 dark:text-white">{t.modelStandard}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{t.modelStandardDesc}</p>
                  <p className="mt-2 text-xs font-medium text-violet-600 dark:text-violet-400">2 {t.credits}/1000 {t.characters}</p>
                </button>
                <button
                  onClick={() => setModel('tts-1-hd')}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    model === 'tts-1-hd'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300'
                  }`}
                >
                  <div className="absolute -top-2 -right-2">
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-2 py-0.5 text-[10px] font-medium text-white">
                      <Star className="h-2.5 w-2.5" />
                      Premium
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="font-medium text-zinc-800 dark:text-white">{t.modelHD}</span>
                  </div>
                  <p className="text-xs text-zinc-500">{t.modelHDDesc}</p>
                  <p className="mt-2 text-xs font-medium text-violet-600 dark:text-violet-400">4 {t.credits}/1000 {t.characters}</p>
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  {t.advancedSettings}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <div className="p-6 space-y-6">
                      {/* Speed Control */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {t.speedLabel}
                          </label>
                          <span className="text-sm font-mono text-violet-600 dark:text-violet-400">
                            {speed.toFixed(2)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.25"
                          max="4"
                          step="0.05"
                          value={speed}
                          onChange={(e) => setSpeed(parseFloat(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-violet-500"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((speed - 0.25) / 3.75) * 100}%, #e4e4e7 ${((speed - 0.25) / 3.75) * 100}%, #e4e4e7 100%)`,
                          }}
                        />
                        <div className="flex justify-between mt-2">
                          {SPEED_PRESETS.map((preset) => (
                            <button
                              key={preset.value}
                              onClick={() => setSpeed(preset.value)}
                              className={`text-xs px-2 py-1 rounded ${
                                Math.abs(speed - preset.value) < 0.1
                                  ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Output Format */}
                      <div>
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-3">
                          {t.formatLabel}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {OUTPUT_FORMATS.map((format) => (
                            <button
                              key={format.id}
                              onClick={() => setOutputFormat(format.id)}
                              className={`relative rounded-lg border px-4 py-2 text-sm transition-all ${
                                outputFormat === format.id
                                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-300'
                              }`}
                            >
                              {format.recommended && (
                                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] text-white">
                                  {lng === 'de' ? 'Empfohlen' : 'Best'}
                                </span>
                              )}
                              <span className="font-medium">{format.label}</span>
                              <span className="ml-1 text-xs opacity-60">({format.desc[lng]})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            {!isAuthenticated ? (
              <Link
                href={`/${lng}/auth/signin`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-400"
              >
                {t.signIn}
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                onClick={generateSpeech}
                disabled={!canGenerate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {t.generate}
                    {characterCount > 0 && (
                      <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                        ~{estimatedCredits} {t.credits}
                      </span>
                    )}
                  </>
                )}
              </motion.button>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                  {error === t.insufficientCredits && (
                    <Link href={`/${lng}/pricing`} className="ml-auto font-medium underline">
                      {t.buyCredits}
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Panel - Audio Player & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Audio Player */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <AudioWaveform className="h-4 w-4" />
                {lng === 'de' ? 'Audioausgabe' : 'Audio Output'}
              </h3>

              {generatedAudio ? (
                <div className="space-y-4">
                  {/* Waveform Visualization (Placeholder) */}
                  <div className="h-24 rounded-xl bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10 flex items-center justify-center overflow-hidden">
                    <div className="flex items-end gap-1 h-16">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 4 }}
                          animate={{
                            height: isPlaying
                              ? Math.random() * 48 + 8
                              : Math.sin(i * 0.5) * 16 + 20,
                          }}
                          transition={{ duration: 0.1 }}
                          className="w-1 rounded-full bg-gradient-to-t from-violet-500 to-purple-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #e4e4e7 ${(currentTime / (duration || 1)) * 100}%, #e4e4e7 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayPause}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:bg-violet-400 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() => generateSpeech()}
                        disabled={isGenerating}
                        className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title={t.regenerate}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 accent-violet-500"
                      />
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadAudio}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 py-3 font-semibold text-violet-600 dark:text-violet-400 transition-colors hover:bg-violet-100 dark:hover:bg-violet-500/20"
                  >
                    <Download className="h-5 w-5" />
                    {t.download} ({outputFormat.toUpperCase()})
                  </motion.button>

                  {/* Generation Info */}
                  {creditsUsed && (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-500">
                      <div className="flex items-center justify-between">
                        <span>{lng === 'de' ? 'Credits verwendet' : 'Credits used'}</span>
                        <span className="font-medium text-violet-600 dark:text-violet-400">{creditsUsed}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400 dark:text-zinc-600">
                  <FileAudio className="h-16 w-16 mb-4" />
                  <p className="text-sm">
                    {lng === 'de' ? 'Generiertes Audio erscheint hier' : 'Generated audio will appear here'}
                  </p>
                </div>
              )}

              {/* Hidden Audio Elements */}
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
              <audio ref={previewAudioRef} />
            </div>

            {/* Tips Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                {t.tips.title}
              </h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                {t.tips.items.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-500">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost Preview Card */}
            {characterCount > 0 && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 p-6"
              >
                <h3 className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-3">
                  {t.costPreview}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{t.characters}</span>
                    <span>{characterCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{t.modelLabel}</span>
                    <span>{model === 'tts-1-hd' ? 'HD' : 'Standard'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>{t.estimatedDuration}</span>
                    <span>~{estimatedDuration}s</span>
                  </div>
                  <div className="border-t border-violet-200 dark:border-violet-500/30 pt-2 flex justify-between font-medium text-violet-700 dark:text-violet-400">
                    <span>{t.totalCost}</span>
                    <span>~{estimatedCredits} {t.credits}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
