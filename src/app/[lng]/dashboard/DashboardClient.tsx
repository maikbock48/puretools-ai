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
  Gift,
  Copy,
  Check,
  Users,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';
import PromoCodeInput from '@/components/PromoCodeInput';
import CreditExpirationWarning from '@/components/CreditExpirationWarning';
import HistoryList from '@/components/HistoryList';

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
      history: 'History',
      analytics: 'Analytics',
      billing: 'Billing',
      profile: 'Profile',
      referral: 'Referral',
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
    profileTitle: 'Profile Settings',
    profileSubtitle: 'Manage your account and preferences',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    memberSince: 'Member Since',
    accountType: 'Account Type',
    freeAccount: 'Free Account',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Email Notifications',
    notificationsDesc: 'Receive updates about new features and promotions',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',
    saveChanges: 'Save Changes',
    saved: 'Saved',
    // Billing translations
    billingTitle: 'Billing & Payments',
    billingSubtitle: 'Manage your credits and payment history',
    currentBalance: 'Current Balance',
    purchaseHistory: 'Purchase History',
    noPurchases: 'No purchases yet',
    creditPackages: 'Credit Packages',
    buyNow: 'Buy Now',
    perCredit: 'per credit',
    bestValue: 'Best Value',
    processing: 'Processing...',
    paymentMethods: 'Payment Methods',
    securePayment: 'Secure payment via Stripe',
    date: 'Date',
    amount: 'Amount',
    status: 'Status',
    completed: 'Completed',
    // Referral translations
    referralTitle: 'Refer Friends & Earn Credits',
    referralSubtitle: 'Share your link and both get 100 credits!',
    yourReferralCode: 'Your Referral Code',
    copyCode: 'Copy Code',
    copyLink: 'Copy Link',
    shareOn: 'Share on',
    referralStats: 'Referral Statistics',
    totalReferrals: 'Total Referrals',
    successfulReferrals: 'Successful',
    earnedCredits: 'Earned Credits',
    yourReferrals: 'Your Referrals',
    noReferralsYet: 'No referrals yet. Share your link to start earning!',
    referredOn: 'Referred on',
    pending: 'Pending',
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
      history: 'Verlauf',
      analytics: 'Statistiken',
      billing: 'Abrechnung',
      profile: 'Profil',
      referral: 'Empfehlung',
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
    profileTitle: 'Profil-Einstellungen',
    profileSubtitle: 'Verwalte dein Konto und deine Einstellungen',
    personalInfo: 'Persönliche Informationen',
    name: 'Name',
    email: 'E-Mail',
    memberSince: 'Mitglied seit',
    accountType: 'Kontotyp',
    freeAccount: 'Kostenloses Konto',
    preferences: 'Einstellungen',
    language: 'Sprache',
    theme: 'Design',
    notifications: 'E-Mail-Benachrichtigungen',
    notificationsDesc: 'Updates über neue Features und Aktionen erhalten',
    dangerZone: 'Gefahrenzone',
    deleteAccount: 'Konto löschen',
    deleteAccountDesc: 'Konto und alle Daten dauerhaft löschen',
    saveChanges: 'Änderungen speichern',
    saved: 'Gespeichert',
    // Billing translations
    billingTitle: 'Abrechnung & Zahlungen',
    billingSubtitle: 'Verwalte deine Credits und Zahlungshistorie',
    currentBalance: 'Aktuelles Guthaben',
    purchaseHistory: 'Kaufhistorie',
    noPurchases: 'Noch keine Käufe',
    creditPackages: 'Credit-Pakete',
    buyNow: 'Jetzt kaufen',
    perCredit: 'pro Credit',
    bestValue: 'Bester Wert',
    processing: 'Wird verarbeitet...',
    paymentMethods: 'Zahlungsmethoden',
    securePayment: 'Sichere Zahlung über Stripe',
    date: 'Datum',
    amount: 'Betrag',
    status: 'Status',
    completed: 'Abgeschlossen',
    // Referral translations
    referralTitle: 'Freunde einladen & Credits verdienen',
    referralSubtitle: 'Teile deinen Link und beide erhalten 100 Credits!',
    yourReferralCode: 'Dein Empfehlungscode',
    copyCode: 'Code kopieren',
    copyLink: 'Link kopieren',
    shareOn: 'Teilen auf',
    referralStats: 'Empfehlungsstatistik',
    totalReferrals: 'Gesamt-Empfehlungen',
    successfulReferrals: 'Erfolgreich',
    earnedCredits: 'Verdiente Credits',
    yourReferrals: 'Deine Empfehlungen',
    noReferralsYet: 'Noch keine Empfehlungen. Teile deinen Link, um zu verdienen!',
    referredOn: 'Empfohlen am',
    pending: 'Ausstehend',
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

type TabKey = 'overview' | 'tools' | 'history' | 'analytics' | 'billing' | 'profile' | 'referral';

export default function DashboardClient({ lng, user }: DashboardClientProps) {
  const t = content[lng];
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(user.credits);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    successfulReferrals: number;
    totalCreditsEarned: number;
    referrals: Array<{
      id: string;
      status: string;
      creditsEarned: number;
      referredAt: string;
      referredName: string | null;
    }>;
  } | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const handlePromoSuccess = (credits: number) => {
    setUserCredits((prev) => prev + credits);
  };

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

  // Fetch referral data when tab is active
  useEffect(() => {
    if (activeTab === 'referral') {
      const fetchReferralData = async () => {
        try {
          const [codeRes, statsRes] = await Promise.all([
            fetch('/api/referral/code'),
            fetch('/api/referral/stats'),
          ]);

          if (codeRes.ok) {
            const data = await codeRes.json();
            setReferralCode(data.code);
            setReferralLink(data.link);
          }

          if (statsRes.ok) {
            const data = await statsRes.json();
            setReferralStats(data);
          }
        } catch (error) {
          console.error('Failed to fetch referral data:', error);
        }
      };

      fetchReferralData();
    }
  }, [activeTab]);

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${lng}` });
  };

  const handleCheckout = async (packageId: string) => {
    setCheckoutLoading(packageId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, language: lng }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const navItems = [
    { key: 'overview' as const, label: t.nav.overview, icon: LayoutDashboard },
    { key: 'tools' as const, label: t.nav.tools, icon: Wrench },
    { key: 'history' as const, label: t.nav.history, icon: History },
    { key: 'analytics' as const, label: t.nav.analytics, icon: BarChart3 },
    { key: 'billing' as const, label: t.nav.billing, icon: CreditCard },
    { key: 'referral' as const, label: t.nav.referral, icon: Gift },
    { key: 'profile' as const, label: t.nav.profile, icon: User },
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

            {/* Credit Expiration Warning */}
            <CreditExpirationWarning credits={userCredits} lng={lng} />

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

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.nav.history}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                {lng === 'de' ? 'Deine gespeicherten Ergebnisse' : 'Your saved results'}
              </p>
            </div>
            <HistoryList lng={lng} showFilters={true} limit={20} />
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

        {activeTab === 'billing' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.billingTitle}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">{t.billingSubtitle}</p>
            </div>

            {/* Current Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent p-6 shadow-lg"
            >
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
                <Sparkles className="h-5 w-5" />
                <span>{t.currentBalance}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-zinc-900 dark:text-white">{userCredits}</span>
                <span className="text-zinc-500">{t.credits}</span>
              </div>
              <PromoCodeInput lng={lng} onSuccess={handlePromoSuccess} />
            </motion.div>

            {/* Credit Packages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">{t.creditPackages}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'starter', credits: 50, price: 499, priceDisplay: lng === 'de' ? '4,99' : '4.99' },
                  { id: 'popular', credits: 150, price: 999, priceDisplay: lng === 'de' ? '9,99' : '9.99', popular: true },
                  { id: 'pro', credits: 500, price: 2499, priceDisplay: lng === 'de' ? '24,99' : '24.99' },
                ].map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl border p-6 transition-all hover:shadow-lg ${
                      pkg.popular
                        ? 'border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/5 ring-2 ring-indigo-500/20'
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
                      <p className="text-zinc-500 mb-1">{t.credits}</p>
                      <p className="text-xs text-zinc-400 mb-4">
                        €{(pkg.price / pkg.credits / 100).toFixed(2)} {t.perCredit}
                      </p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">€{pkg.priceDisplay}</p>
                      <button
                        onClick={() => handleCheckout(pkg.id)}
                        disabled={checkoutLoading === pkg.id}
                        className="w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white transition-colors hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading === pkg.id ? t.processing : t.buyNow}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-500">
                <CreditCard className="h-4 w-4" />
                <span>{t.securePayment}</span>
              </div>
            </motion.div>

            {/* Purchase History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2">
                  <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">{t.purchaseHistory}</h2>
              </div>

              {transactions.filter(tx => tx.type === 'PURCHASE').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">{t.date}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">{t.credits}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">{t.amount}</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">{t.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(tx => tx.type === 'PURCHASE')
                        .map((tx) => (
                          <tr key={tx.id} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                              {new Date(tx.createdAt).toLocaleDateString(lng === 'de' ? 'de-DE' : 'en-US')}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              +{tx.amount}
                            </td>
                            <td className="py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300">
                              {tx.description}
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                {t.completed}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-zinc-500">
                  {isLoading ? t.loading : t.noPurchases}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.profileTitle}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">{t.profileSubtitle}</p>
            </div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">{t.personalInfo}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-500">{t.name}</label>
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
                    <span className="text-lg font-medium text-zinc-900 dark:text-white">
                      {user.name || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-500">{t.email}</label>
                  <p className="text-zinc-900 dark:text-white">{user.email || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-500">{t.accountType}</label>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-700 dark:text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.freeAccount}
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-500">{t.credits}</label>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{user.credits}</p>
                </div>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">{t.preferences}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{t.language}</p>
                    <p className="text-sm text-zinc-500">{lng === 'de' ? 'Deutsch' : 'English'}</p>
                  </div>
                  <Link
                    href={lng === 'de' ? '/en/dashboard' : '/de/dashboard'}
                    className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {lng === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
                  </Link>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{t.notifications}</p>
                    <p className="text-sm text-zinc-500">{t.notificationsDesc}</p>
                  </div>
                  <button className="relative h-6 w-11 rounded-full bg-zinc-200 dark:bg-zinc-700 transition-colors">
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-6"
            >
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">{t.dangerZone}</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">{t.deleteAccount}</p>
                  <p className="text-sm text-zinc-500">{t.deleteAccountDesc}</p>
                </div>
                <button className="rounded-lg border border-red-300 dark:border-red-500/50 bg-white dark:bg-transparent px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                  {t.deleteAccount}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'referral' && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.referralTitle}</h1>
              <p className="text-zinc-500 dark:text-zinc-400">{t.referralSubtitle}</p>
            </div>

            {/* Referral Code Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-white dark:from-indigo-500/10 dark:via-purple-500/5 dark:to-transparent p-6 shadow-lg"
            >
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-4">
                <Gift className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">{t.yourReferralCode}</span>
              </div>

              {/* Code Display */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3">
                  <code className="flex-1 text-lg font-mono font-bold text-zinc-900 dark:text-white tracking-wider">
                    {referralCode || '...'}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(referralCode);
                      setCopied('code');
                      setTimeout(() => setCopied(null), 2000);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                  >
                    {copied === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === 'code' ? (lng === 'de' ? 'Kopiert!' : 'Copied!') : t.copyCode}
                  </button>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralLink);
                    setCopied('link');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-colors"
                >
                  {copied === 'link' ? <Check className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                  {copied === 'link' ? (lng === 'de' ? 'Kopiert!' : 'Copied!') : t.copyLink}
                </button>
              </div>

              {/* Social Share Buttons */}
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{t.shareOn}</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Get free AI tools at PureTools! Sign up with my link and we both get 100 credits: ${referralLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a8cd8] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Twitter/X
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#166fe5] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white hover:bg-[#004182] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Get free AI tools at PureTools! Sign up with my link and we both get 100 credits: ${referralLink}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20bd5a] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.totalReferrals}</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {referralStats?.totalReferrals || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 p-2">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.successfulReferrals}</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {referralStats?.successfulReferrals || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-purple-100 dark:bg-purple-500/10 p-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-zinc-500">{t.earnedCredits}</span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {referralStats?.totalCreditsEarned || 0}
                </p>
              </motion.div>
            </div>

            {/* Referrals List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">{t.yourReferrals}</h2>
              </div>

              {referralStats && referralStats.referrals.length > 0 ? (
                <div className="space-y-3">
                  {referralStats.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-100 dark:border-zinc-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-white">
                            {referral.referredName || (lng === 'de' ? 'Anonymer Nutzer' : 'Anonymous User')}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {t.referredOn} {new Date(referral.referredAt).toLocaleDateString(lng === 'de' ? 'de-DE' : 'en-US')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          referral.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        }`}>
                          {referral.status === 'completed' ? t.completed : t.pending}
                        </span>
                        {referral.status === 'completed' && (
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                            +{referral.creditsEarned} Credits
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Gift className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                  <p>{t.noReferralsYet}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
