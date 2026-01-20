'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  CreditCard,
  History,
  BarChart3,
  LogOut,
  User,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Languages,
  FileAudio,
  FileText,
  LayoutDashboard,
  Wrench,
  Image,
  QrCode,
  FileType,
  Video,
  Music,
  Scissors,
  Scan,
  Wine,
  Sticker,
  Contact,
  Eraser,
  Code,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';

interface DashboardClientProps {
  lng: Language;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    credits: number;
  };
}

const content = {
  en: {
    greeting: 'Welcome back',
    credits: 'Credits',
    buyCredits: 'Buy Credits',
    recentActivity: 'Recent Activity',
    usageOverview: 'Usage Overview',
    transactions: 'Transactions',
    noTransactions: 'No transactions yet',
    signOut: 'Sign Out',
    creditsAvailable: 'credits available',
    last30Days: 'Last 30 days',
    toolUsage: 'Tool Usage',
    translate: 'Translator',
    transcribe: 'Transcriber',
    summarize: 'Summarizer',
    loading: 'Loading...',
    noUsageData: 'No usage data yet',
    transactionTypes: {
      PURCHASE: 'Credit Purchase',
      USAGE: 'Tool Usage',
      BONUS: 'Bonus Credits',
      REFUND: 'Refund',
    },
    packages: [
      { credits: 50, price: '4.99', popular: false },
      { credits: 150, price: '9.99', popular: true },
      { credits: 500, price: '24.99', popular: false },
    ],
    popular: 'Popular',
    nav: {
      overview: 'Overview',
      tools: 'Tools',
      analytics: 'Analytics',
    },
    toolCategories: {
      image: 'Image Tools',
      qr: 'QR & Codes',
      document: 'Documents',
      media: 'Media',
      ai: 'AI Tools',
    },
    tryTool: 'Open Tool',
    freeTag: 'Free',
    aiTag: 'AI',
    analyticsTitle: 'Usage Analytics',
    analyticsSubtitle: 'Track your tool usage and credit spending',
    dailyUsage: 'Daily Usage',
    last7Days: 'Last 7 days',
    last30Days2: 'Last 30 days',
    totalUsed: 'Total Used',
    averageDaily: 'Average Daily',
    mostUsedTool: 'Most Used',
    noData: 'No data yet',
    creditsUnit: 'credits',
  },
  de: {
    greeting: 'Willkommen zurück',
    credits: 'Credits',
    buyCredits: 'Credits kaufen',
    recentActivity: 'Letzte Aktivität',
    usageOverview: 'Nutzungsübersicht',
    transactions: 'Transaktionen',
    noTransactions: 'Noch keine Transaktionen',
    signOut: 'Abmelden',
    creditsAvailable: 'Credits verfügbar',
    last30Days: 'Letzte 30 Tage',
    toolUsage: 'Tool-Nutzung',
    translate: 'Übersetzer',
    transcribe: 'Transkription',
    summarize: 'Zusammenfassung',
    loading: 'Laden...',
    noUsageData: 'Noch keine Nutzungsdaten',
    transactionTypes: {
      PURCHASE: 'Credit-Kauf',
      USAGE: 'Tool-Nutzung',
      BONUS: 'Bonus-Credits',
      REFUND: 'Rückerstattung',
    },
    packages: [
      { credits: 50, price: '4,99', popular: false },
      { credits: 150, price: '9,99', popular: true },
      { credits: 500, price: '24,99', popular: false },
    ],
    popular: 'Beliebt',
    nav: {
      overview: 'Übersicht',
      tools: 'Tools',
      analytics: 'Statistiken',
    },
    toolCategories: {
      image: 'Bild-Tools',
      qr: 'QR & Codes',
      document: 'Dokumente',
      media: 'Medien',
      ai: 'KI-Tools',
    },
    tryTool: 'Tool öffnen',
    freeTag: 'Kostenlos',
    aiTag: 'KI',
    analyticsTitle: 'Nutzungsstatistiken',
    analyticsSubtitle: 'Verfolge deine Tool-Nutzung und Credit-Ausgaben',
    dailyUsage: 'Tägliche Nutzung',
    last7Days: 'Letzte 7 Tage',
    last30Days2: 'Letzte 30 Tage',
    totalUsed: 'Gesamt verbraucht',
    averageDaily: 'Durchschnitt/Tag',
    mostUsedTool: 'Meistgenutzt',
    noData: 'Noch keine Daten',
    creditsUnit: 'Credits',
  },
};

// Tool definitions
const tools = [
  { key: 'image-compressor', icon: Image, category: 'image', isAI: false },
  { key: 'heic-converter', icon: FileType, category: 'image', isAI: false },
  { key: 'background-remover', icon: Eraser, category: 'image', isAI: false },
  { key: 'social-cropper', icon: Scissors, category: 'image', isAI: false },
  { key: 'sticker-maker', icon: Sticker, category: 'image', isAI: false },
  { key: 'pdf-to-jpg', icon: FileType, category: 'image', isAI: false },
  { key: 'qr-generator', icon: QrCode, category: 'qr', isAI: false },
  { key: 'qr-business-card', icon: Contact, category: 'qr', isAI: false },
  { key: 'wifi-qr', icon: QrCode, category: 'qr', isAI: false },
  { key: 'bac-calculator', icon: Wine, category: 'qr', isAI: false },
  { key: 'pdf-toolkit', icon: FileText, category: 'document', isAI: false },
  { key: 'json-formatter', icon: Code, category: 'document', isAI: false },
  { key: 'code-beautifier', icon: Code, category: 'document', isAI: false },
  { key: 'csv-to-excel', icon: FileType, category: 'document', isAI: false },
  { key: 'ocr-scanner', icon: Scan, category: 'document', isAI: false },
  { key: 'audio-cutter', icon: Music, category: 'media', isAI: false },
  { key: 'audio-converter', icon: Music, category: 'media', isAI: false },
  { key: 'video-trimmer', icon: Video, category: 'media', isAI: false },
  { key: 'ai-translator', icon: Languages, category: 'ai', isAI: true },
  { key: 'ai-transcriber', icon: FileAudio, category: 'ai', isAI: true },
  { key: 'ai-summarizer', icon: FileText, category: 'ai', isAI: true },
];

const toolNames: Record<string, Record<string, string>> = {
  en: {
    'image-compressor': 'Image Compressor',
    'heic-converter': 'HEIC to JPG',
    'background-remover': 'Background Remover',
    'social-cropper': 'Social Media Cropper',
    'sticker-maker': 'Sticker Maker',
    'pdf-to-jpg': 'PDF to JPG',
    'qr-generator': 'QR Generator',
    'qr-business-card': 'QR Business Card',
    'wifi-qr': 'WiFi QR',
    'bac-calculator': 'BAC Calculator',
    'pdf-toolkit': 'PDF Toolkit',
    'json-formatter': 'JSON Formatter',
    'code-beautifier': 'Code Beautifier',
    'csv-to-excel': 'CSV to Excel',
    'ocr-scanner': 'OCR Scanner',
    'audio-cutter': 'Audio Cutter',
    'audio-converter': 'Audio Converter',
    'video-trimmer': 'Video Trimmer',
    'ai-translator': 'AI Translator',
    'ai-transcriber': 'AI Transcriber',
    'ai-summarizer': 'AI Summarizer',
  },
  de: {
    'image-compressor': 'Bild-Kompressor',
    'heic-converter': 'HEIC zu JPG',
    'background-remover': 'Hintergrund entfernen',
    'social-cropper': 'Social Media Cropper',
    'sticker-maker': 'Sticker Maker',
    'pdf-to-jpg': 'PDF zu JPG',
    'qr-generator': 'QR-Generator',
    'qr-business-card': 'QR-Visitenkarte',
    'wifi-qr': 'WLAN-QR',
    'bac-calculator': 'Promillerechner',
    'pdf-toolkit': 'PDF-Toolkit',
    'json-formatter': 'JSON-Formatter',
    'code-beautifier': 'Code-Verschönerer',
    'csv-to-excel': 'CSV zu Excel',
    'ocr-scanner': 'OCR-Scanner',
    'audio-cutter': 'Audio schneiden',
    'audio-converter': 'Audio-Konverter',
    'video-trimmer': 'Video schneiden',
    'ai-translator': 'KI-Übersetzer',
    'ai-transcriber': 'KI-Transkription',
    'ai-summarizer': 'KI-Zusammenfassung',
  },
};

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface UsageStats {
  totalCreditsUsed: number;
  byTool: Record<string, number>;
  daily: Array<{ date: string; credits: number }>;
}

const toolIcons: Record<string, typeof Languages> = {
  translate: Languages,
  transcribe: FileAudio,
  summarize: FileText,
};

type TabKey = 'overview' | 'tools' | 'analytics';

export default function DashboardClient({ lng, user }: DashboardClientProps) {
  const t = content[lng];
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch user data
    const fetchData = async () => {
      try {
        const [txRes, statsRes] = await Promise.all([
          fetch('/api/user/transactions'),
          fetch('/api/user/usage'),
        ]);

        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.transactions || []);
        }

        if (statsRes.ok) {
          const data = await statsRes.json();
          setUsageStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${lng}` });
  };

  const navItems = [
    { key: 'overview' as const, label: t.nav.overview, icon: LayoutDashboard },
    { key: 'tools' as const, label: t.nav.tools, icon: Wrench },
    { key: 'analytics' as const, label: t.nav.analytics, icon: BarChart3 },
  ];

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="flex min-h-[calc(100vh-200px)]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-l-2xl">
        {/* User Info */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="h-12 w-12 rounded-full border-2 border-indigo-500"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-zinc-500">{user.credits} Credits</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-20 left-4 right-4 z-40 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="h-10 w-10 rounded-full border-2 border-indigo-500"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {user.name?.split(' ')[0] || 'User'}
            </p>
            <p className="text-xs text-zinc-500">{user.credits} Credits</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          ) : (
            <Menu className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-36 left-4 right-4 z-40 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-lg p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-5 w-5" />
            {t.signOut}
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 lg:pt-8 pt-24">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">{t.greeting},</p>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{user.name || user.email}</h1>
            </div>

            {/* Credits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent p-6 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
                    <CreditCard className="h-5 w-5" />
                    <span>{t.credits}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-zinc-900 dark:text-white">{user.credits}</span>
                    <span className="text-zinc-500">{t.creditsAvailable}</span>
                  </div>
                </div>
                <Link
                  href={`/${lng}/pricing`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500"
                >
                  <Plus className="h-5 w-5" />
                  {t.buyCredits}
                </Link>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usage Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">{t.usageOverview}</h2>
                  <span className="ml-auto text-sm text-zinc-500">{t.last30Days}</span>
                </div>

                {usageStats ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                        {usageStats.totalCreditsUsed}
                      </span>
                      <span className="block text-sm text-zinc-500 mt-1">{t.credits}</span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t.toolUsage}</h3>
                      {Object.entries(usageStats.byTool).map(([tool, credits]) => {
                        const Icon = toolIcons[tool] || Sparkles;
                        const toolName = t[tool as keyof typeof t] || tool;
                        const percentage = usageStats.totalCreditsUsed
                          ? Math.round((credits / usageStats.totalCreditsUsed) * 100)
                          : 0;

                        return (
                          <div key={tool} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">{toolName as string}</span>
                              </div>
                              <span className="text-zinc-500">{credits} credits</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-zinc-500">
                    {isLoading ? t.loading : t.noUsageData}
                  </div>
                )}
              </motion.div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2">
                    <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">{t.transactions}</h2>
                </div>

                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 border border-zinc-100 dark:border-zinc-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                isPositive
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                  : 'bg-red-100 dark:bg-red-500/20'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {t.transactionTypes[tx.type as keyof typeof t.transactionTypes] ||
                                  tx.type}
                              </p>
                              <p className="text-xs text-zinc-500">{tx.description}</p>
                            </div>
                          </div>
                          <span
                            className={`font-medium ${
                              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {tx.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-zinc-500">
                    {isLoading ? t.loading : t.noTransactions}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Buy Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{t.buyCredits}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {t.packages.map((pkg, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl border p-6 transition-all hover:shadow-lg ${
                      pkg.popular
                        ? 'border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/5'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
                        {t.popular}
                      </span>
                    )}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-3xl font-bold text-zinc-900 dark:text-white">{pkg.credits}</span>
                      </div>
                      <p className="text-zinc-500 mb-4">Credits</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">€{pkg.price}</p>
                      <button className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 shadow-lg shadow-indigo-500/25">
                        {t.buyCredits}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.nav.tools}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                {lng === 'de' ? 'Alle verfügbaren Tools' : 'All available tools'}
              </p>
            </div>

            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {t.toolCategories[category as keyof typeof t.toolCategories]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    const name = toolNames[lng][tool.key];
                    return (
                      <Link
                        key={tool.key}
                        href={`/${lng}/tools/${tool.key}`}
                        className="group flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
                      >
                        <div className={`rounded-xl p-3 ${
                          tool.isAI
                            ? 'bg-purple-100 dark:bg-purple-500/20'
                            : 'bg-indigo-100 dark:bg-indigo-500/20'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            tool.isAI
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 dark:text-white truncate">{name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tool.isAI
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {tool.isAI ? t.aiTag : t.freeTag}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.analyticsTitle}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">{t.analyticsSubtitle}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.totalUsed}</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {usageStats?.totalCreditsUsed || 0}
                </p>
                <p className="text-sm text-zinc-500 mt-1">{t.last30Days}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.averageDaily}</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {usageStats ? Math.round(usageStats.totalCreditsUsed / 30 * 10) / 10 : 0}
                </p>
                <p className="text-sm text-zinc-500 mt-1">{t.creditsUnit}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-purple-100 dark:bg-purple-500/10 p-2">
                    <Languages className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.mostUsedTool}</span>
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {usageStats && Object.keys(usageStats.byTool).length > 0
                    ? (() => {
                        const topTool = Object.entries(usageStats.byTool).sort((a, b) => b[1] - a[1])[0][0];
                        const toolLabel = topTool === 'translate' ? t.translate :
                                          topTool === 'transcribe' ? t.transcribe :
                                          topTool === 'summarize' ? t.summarize : topTool;
                        return toolLabel;
                      })()
                    : t.noData}
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  {usageStats && Object.keys(usageStats.byTool).length > 0
                    ? `${Object.entries(usageStats.byTool).sort((a, b) => b[1] - a[1])[0][1]} ${t.creditsUnit}`
                    : ''}
                </p>
              </motion.div>
            </div>

            {/* Daily Usage Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">{t.dailyUsage}</h2>
                </div>
                <span className="text-sm text-zinc-500">{t.last30Days2}</span>
              </div>

              {usageStats && usageStats.daily && usageStats.daily.length > 0 ? (
                <div className="space-y-4">
                  {/* Bar Chart */}
                  <div className="flex items-end gap-1 h-40">
                    {(() => {
                      const last30Days = [];
                      for (let i = 29; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toISOString().split('T')[0];
                        const dayData = usageStats.daily.find(d => d.date === dateStr);
                        last30Days.push({
                          date: dateStr,
                          credits: dayData?.credits || 0,
                          day: date.getDate(),
                        });
                      }
                      const maxCredits = Math.max(...last30Days.map(d => d.credits), 1);

                      return last30Days.map((day, i) => (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t transition-all hover:bg-indigo-600 dark:hover:bg-indigo-300"
                            style={{ height: `${(day.credits / maxCredits) * 100}%`, minHeight: day.credits > 0 ? '4px' : '0' }}
                            title={`${day.date}: ${day.credits} credits`}
                          />
                          {i % 5 === 0 && (
                            <span className="text-[10px] text-zinc-400">{day.day}</span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-zinc-500">
                  {isLoading ? t.loading : t.noData}
                </div>
              )}
            </motion.div>

            {/* Tool Usage Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2">
                  <Wrench className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">{t.toolUsage}</h2>
              </div>

              {usageStats && Object.keys(usageStats.byTool).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(usageStats.byTool)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tool, credits]) => {
                      const Icon = toolIcons[tool] || Sparkles;
                      const toolName = t[tool as keyof typeof t] || tool;
                      const percentage = usageStats.totalCreditsUsed
                        ? Math.round((credits / usageStats.totalCreditsUsed) * 100)
                        : 0;

                      return (
                        <div key={tool} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2">
                                <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                              </div>
                              <span className="font-medium text-zinc-900 dark:text-white">{toolName as string}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-zinc-900 dark:text-white">{credits}</span>
                              <span className="text-zinc-500 ml-1">{t.creditsUnit}</span>
                              <span className="text-zinc-400 ml-2">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-zinc-500">
                  {isLoading ? t.loading : t.noData}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
