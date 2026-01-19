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
} from 'lucide-react';
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
}

const toolIcons: Record<string, typeof Languages> = {
  translate: Languages,
  transcribe: FileAudio,
  summarize: FileText,
};

export default function DashboardClient({ lng, user }: DashboardClientProps) {
  const t = content[lng];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="h-16 w-16 rounded-full border-2 border-indigo-500"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
              <User className="h-8 w-8 text-indigo-400" />
            </div>
          )}
          <div>
            <p className="text-zinc-400">{t.greeting},</p>
            <h1 className="text-2xl font-bold text-white">{user.name || user.email}</h1>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {t.signOut}
        </button>
      </div>

      {/* Credits Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <CreditCard className="h-5 w-5" />
              <span>{t.credits}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{user.credits}</span>
              <span className="text-zinc-500">{t.creditsAvailable}</span>
            </div>
          </div>
          <a
            href={`/${lng}/pricing`}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400"
          >
            <Plus className="h-5 w-5" />
            {t.buyCredits}
          </a>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h2 className="font-semibold text-white">{t.usageOverview}</h2>
            <span className="ml-auto text-sm text-zinc-500">{t.last30Days}</span>
          </div>

          {usageStats ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <span className="text-4xl font-bold text-indigo-400">
                  {usageStats.totalCreditsUsed}
                </span>
                <span className="block text-sm text-zinc-500 mt-1">{t.credits}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-400">{t.toolUsage}</h3>
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
                          <span className="text-zinc-300">{toolName as string}</span>
                        </div>
                        <span className="text-zinc-500">{credits} credits</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
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
              {isLoading ? 'Loading...' : 'No usage data yet'}
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <History className="h-5 w-5 text-emerald-400" />
            <h2 className="font-semibold text-white">{t.transactions}</h2>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-800/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {t.transactionTypes[tx.type as keyof typeof t.transactionTypes] ||
                            tx.type}
                        </p>
                        <p className="text-xs text-zinc-500">{tx.description}</p>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
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
              {isLoading ? 'Loading...' : t.noTransactions}
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
        <h2 className="text-xl font-bold text-white mb-4">{t.buyCredits}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {t.packages.map((pkg, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-6 transition-all hover:border-indigo-500/50 ${
                pkg.popular
                  ? 'border-indigo-500/50 bg-indigo-500/5'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <span className="text-3xl font-bold text-white">{pkg.credits}</span>
                </div>
                <p className="text-zinc-500 mb-4">Credits</p>
                <p className="text-2xl font-bold text-white mb-4">€{pkg.price}</p>
                <button className="w-full rounded-xl bg-indigo-500 py-2 font-medium text-white transition-colors hover:bg-indigo-400">
                  {t.buyCredits}
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
