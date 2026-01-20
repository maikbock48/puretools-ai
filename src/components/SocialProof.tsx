'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, Star } from 'lucide-react';

interface SocialProofProps {
  lng: string;
}

export default function SocialProof({ lng }: SocialProofProps) {
  const [counts, setCounts] = useState({
    users: 0,
    tools: 0,
    processed: 0,
  });

  // Animate counting up
  useEffect(() => {
    const targetCounts = {
      users: 12500,
      tools: 13,
      processed: 150000,
    };

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setCounts({
        users: Math.round(targetCounts.users * eased),
        tools: Math.round(targetCounts.tools * eased),
        processed: Math.round(targetCounts.processed * eased),
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const texts = {
    en: {
      users: 'Happy Users',
      tools: 'Free Tools',
      processed: 'Files Processed',
      rating: 'Average Rating',
      trust: 'Trusted by thousands of users worldwide',
    },
    de: {
      users: 'Zufriedene Nutzer',
      tools: 'Kostenlose Tools',
      processed: 'Verarbeitete Dateien',
      rating: 'Durchschnittliche Bewertung',
      trust: 'Vertraut von tausenden Nutzern weltweit',
    },
  };

  const t = texts[lng as keyof typeof texts] || texts.en;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return num.toString();
  };

  const stats = [
    { icon: Users, value: formatNumber(counts.users), label: t.users, color: 'text-blue-500' },
    { icon: Zap, value: counts.tools.toString(), label: t.tools, color: 'text-amber-500' },
    { icon: Shield, value: formatNumber(counts.processed), label: t.processed, color: 'text-emerald-500' },
    { icon: Star, value: '4.9', label: t.rating, color: 'text-purple-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-12"
    >
      <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8">{t.trust}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 ${stat.color} mb-3`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
