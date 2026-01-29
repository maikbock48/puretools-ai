'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Star,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  FileText,
  QrCode,
  Languages,
  FileAudio,
  Wand2,
  Video,
  ChevronDown,
  Filter,
  Mic2,
} from 'lucide-react';
import Link from 'next/link';

interface HistoryEntry {
  id: string;
  toolType: string;
  title: string | null;
  inputData: Record<string, unknown> | null;
  outputData: Record<string, unknown> | null;
  previewUrl: string | null;
  isFavorite: boolean;
  createdAt: string;
}

interface HistoryListProps {
  lng: string;
  toolFilter?: string;
  showFilters?: boolean;
  limit?: number;
}

const translations = {
  en: {
    title: 'History',
    subtitle: 'Your recent tool results',
    empty: 'No history yet',
    emptySubtitle: 'Your tool results will appear here',
    favorites: 'Favorites',
    all: 'All',
    loadMore: 'Load More',
    delete: 'Delete',
    viewTool: 'Open Tool',
    filterByTool: 'Filter by tool',
    allTools: 'All Tools',
  },
  de: {
    title: 'Verlauf',
    subtitle: 'Deine letzten Tool-Ergebnisse',
    empty: 'Noch kein Verlauf',
    emptySubtitle: 'Deine Tool-Ergebnisse erscheinen hier',
    favorites: 'Favoriten',
    all: 'Alle',
    loadMore: 'Mehr laden',
    delete: 'Löschen',
    viewTool: 'Tool öffnen',
    filterByTool: 'Nach Tool filtern',
    allTools: 'Alle Tools',
  },
};

const toolIcons: Record<string, typeof QrCode> = {
  'qr-generator': QrCode,
  'ai-summarizer': FileText,
  'ai-translator': Languages,
  'ai-transcriber': FileAudio,
  'ai-image-generator': Wand2,
  'ai-video-generator': Video,
  'ai-voice-generator': Mic2,
  'image-compressor': ImageIcon,
  'pdf-toolkit': FileText,
  'heic-converter': ImageIcon,
};

const toolNames: Record<string, { en: string; de: string }> = {
  'qr-generator': { en: 'QR Generator', de: 'QR Generator' },
  'ai-summarizer': { en: 'AI Summarizer', de: 'KI Zusammenfassung' },
  'ai-translator': { en: 'AI Translator', de: 'KI Übersetzer' },
  'ai-transcriber': { en: 'AI Transcriber', de: 'KI Transkription' },
  'ai-image-generator': { en: 'AI Image', de: 'KI Bild' },
  'ai-video-generator': { en: 'AI Video', de: 'KI Video' },
  'ai-voice-generator': { en: 'AI Voice', de: 'KI Stimme' },
  'image-compressor': { en: 'Image Compressor', de: 'Bildkompressor' },
  'pdf-toolkit': { en: 'PDF Toolkit', de: 'PDF Toolkit' },
  'heic-converter': { en: 'HEIC Converter', de: 'HEIC Konverter' },
};

export default function HistoryList({
  lng,
  toolFilter,
  showFilters = true,
  limit = 20,
}: HistoryListProps) {
  const t = translations[lng as keyof typeof translations] || translations.en;
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [selectedTool, setSelectedTool] = useState<string>(toolFilter || '');
  const [showToolFilter, setShowToolFilter] = useState(false);

  const fetchHistory = useCallback(async (reset = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(reset ? 0 : offset),
        ...(filter === 'favorites' && { favorites: 'true' }),
        ...(selectedTool && { toolType: selectedTool }),
      });

      const response = await fetch(`/api/history?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setHistory(data.history);
          setOffset(limit);
        } else {
          setHistory((prev) => [...prev, ...data.history]);
          setOffset((prev) => prev + limit);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, filter, selectedTool]);

  useEffect(() => {
    fetchHistory(true);
  }, [filter, selectedTool]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState }),
      });

      setHistory((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFavorite: !currentState } : item
        )
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return lng === 'de' ? 'Gerade eben' : 'Just now';
    if (diffHours < 24) return `${diffHours}h ${lng === 'de' ? 'her' : 'ago'}`;
    if (diffDays < 7) return `${diffDays}d ${lng === 'de' ? 'her' : 'ago'}`;
    return date.toLocaleDateString(lng === 'de' ? 'de-DE' : 'en-US');
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
              <History className="h-5 w-5" />
              {t.title}
            </h2>
            <p className="text-sm text-zinc-500">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorites Toggle */}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors ${
                  filter === 'favorites'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                }`}
              >
                <Star className="h-3 w-3" />
                {t.favorites}
              </button>
            </div>

            {/* Tool Filter */}
            <div className="relative">
              <button
                onClick={() => setShowToolFilter(!showToolFilter)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Filter className="h-4 w-4" />
                {selectedTool ? toolNames[selectedTool]?.[lng as 'en' | 'de'] || selectedTool : t.allTools}
                <ChevronDown className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showToolFilter && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setSelectedTool('');
                        setShowToolFilter(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                        !selectedTool ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {t.allTools}
                    </button>
                    {Object.entries(toolNames).map(([key, names]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedTool(key);
                          setShowToolFilter(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                          selectedTool === key ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {names[lng as 'en' | 'de']}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {isLoading && history.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">{t.empty}</p>
          <p className="text-sm text-zinc-500">{t.emptySubtitle}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {history.map((entry) => {
                const Icon = toolIcons[entry.toolType] || FileText;
                const toolName = toolNames[entry.toolType]?.[lng as 'en' | 'de'] || entry.toolType;

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                  >
                    {/* Preview Image */}
                    {entry.previewUrl ? (
                      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <img
                          src={entry.previewUrl}
                          alt={entry.title || ''}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                        <Icon className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/10">
                            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs text-zinc-500">{toolName}</span>
                        </div>
                        <span className="text-xs text-zinc-400">{formatDate(entry.createdAt)}</span>
                      </div>

                      <h3 className="font-medium text-zinc-800 dark:text-white truncate mb-3">
                        {entry.title || 'Untitled'}
                      </h3>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFavorite(entry.id, entry.isFavorite)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              entry.isFavorite
                                ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                            }`}
                          >
                            <Star className={`h-4 w-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <Link
                          href={`/${lng}/tools/${entry.toolType}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t.viewTool}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchHistory(false)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
