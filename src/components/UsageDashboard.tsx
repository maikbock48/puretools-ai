'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  FileText,
  Image,
  Music,
  Languages,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface UsageStats {
  totalCreditsUsed: number;
  creditsRemaining: number;
  toolsUsed: number;
  filesProcessed: number;
  timesSaved: number; // in minutes
  recentActivity: {
    tool: string;
    date: string;
    credits: number;
  }[];
  topTools: {
    name: string;
    icon: string;
    count: number;
    percentage: number;
  }[];
}

interface UsageDashboardProps {
  lng: string;
  stats?: UsageStats;
}

const toolIcons: Record<string, typeof FileText> = {
  translate: Languages,
  summarize: FileText,
  transcribe: Music,
  'image-compressor': Image,
  'pdf-toolkit': FileText,
  default: Zap,
};

export default function UsageDashboard({ lng, stats }: UsageDashboardProps) {
  // Demo data if no stats provided
  const defaultStats: UsageStats = {
    totalCreditsUsed: 1250,
    creditsRemaining: 750,
    toolsUsed: 8,
    filesProcessed: 47,
    timesSaved: 180,
    recentActivity: [
      { tool: 'AI Translator', date: '2 hours ago', credits: 15 },
      { tool: 'Image Compressor', date: '5 hours ago', credits: 0 },
      { tool: 'PDF Toolkit', date: '1 day ago', credits: 0 },
      { tool: 'AI Summarizer', date: '2 days ago', credits: 25 },
    ],
    topTools: [
      { name: 'Image Compressor', icon: 'image-compressor', count: 23, percentage: 48 },
      { name: 'AI Translator', icon: 'translate', count: 12, percentage: 25 },
      { name: 'PDF Toolkit', icon: 'pdf-toolkit', count: 8, percentage: 17 },
      { name: 'AI Summarizer', icon: 'summarize', count: 4, percentage: 10 },
    ],
  };

  const data = stats || defaultStats;

  const texts = {
    en: {
      title: 'Your Usage Dashboard',
      subtitle: 'Track your activity and credits',
      creditsUsed: 'Credits Used',
      creditsRemaining: 'Credits Remaining',
      toolsUsed: 'Tools Used',
      filesProcessed: 'Files Processed',
      timeSaved: 'Time Saved',
      minutes: 'minutes',
      recentActivity: 'Recent Activity',
      topTools: 'Most Used Tools',
      viewAll: 'View All',
      buyCredits: 'Buy More Credits',
    },
    de: {
      title: 'Dein Nutzungs-Dashboard',
      subtitle: 'Verfolge deine Aktivität und Credits',
      creditsUsed: 'Credits Verwendet',
      creditsRemaining: 'Credits Verbleibend',
      toolsUsed: 'Tools Verwendet',
      filesProcessed: 'Dateien Verarbeitet',
      timeSaved: 'Zeit Gespart',
      minutes: 'Minuten',
      recentActivity: 'Letzte Aktivität',
      topTools: 'Meist Verwendet',
      viewAll: 'Alle Anzeigen',
      buyCredits: 'Credits Kaufen',
    },
  };

  const t = texts[lng as keyof typeof texts] || texts.en;

  const statCards = [
    {
      label: t.creditsUsed,
      value: data.totalCreditsUsed.toLocaleString(),
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-500'
    },
    {
      label: t.creditsRemaining,
      value: data.creditsRemaining.toLocaleString(),
      icon: Sparkles,
      color: 'bg-indigo-500/10 text-indigo-500'
    },
    {
      label: t.toolsUsed,
      value: data.toolsUsed.toString(),
      icon: BarChart3,
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      label: t.filesProcessed,
      value: data.filesProcessed.toString(),
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      label: t.timeSaved,
      value: `${data.timesSaved} ${t.minutes}`,
      icon: Clock,
      color: 'bg-purple-500/10 text-purple-500'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.title}</h2>
          <p className="text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
        </div>
        <Link
          href={`/${lng}/pricing`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {t.buyCredits}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white">{t.recentActivity}</h3>
            <button className="text-sm text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
              {t.viewAll}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700">
                    <Zap className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white text-sm">
                      {activity.tool}
                    </div>
                    <div className="text-xs text-zinc-500">{activity.date}</div>
                  </div>
                </div>
                {activity.credits > 0 && (
                  <span className="text-sm font-medium text-amber-500">
                    -{activity.credits} credits
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Tools */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">{t.topTools}</h3>

          <div className="space-y-4">
            {data.topTools.map((tool, index) => {
              const IconComponent = toolIcons[tool.icon] || toolIcons.default;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {tool.name}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500">{tool.count} uses</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tool.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
