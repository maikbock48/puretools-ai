'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Globe,
  Lock,
  Cpu,
  Heart,
  Github,
  Twitter,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';

interface AboutClientProps {
  lng: Language;
}

const content = {
  en: {
    hero: {
      badge: 'About Us',
      title: 'Privacy Should Be',
      titleHighlight: 'The Default',
      subtitle: 'We believe your data belongs to you. That\'s why we built tools that work entirely in your browser — no uploads, no servers, no compromises.',
    },
    mission: {
      title: 'Our Mission',
      description: 'To democratize powerful digital tools while respecting user privacy. Every tool we build processes data locally, ensuring your sensitive information never leaves your device.',
    },
    values: [
      {
        icon: Shield,
        title: 'Privacy First',
        description: 'Your data stays on your device. Always. We don\'t collect, store, or transmit your files.',
      },
      {
        icon: Zap,
        title: 'Blazing Fast',
        description: 'No upload wait times. Processing happens instantly using your browser\'s computing power.',
      },
      {
        icon: Globe,
        title: 'Works Offline',
        description: 'Once loaded, most tools work without internet. Perfect for sensitive work environments.',
      },
      {
        icon: Lock,
        title: 'Zero Trust',
        description: 'We designed our architecture so you don\'t have to trust us. The code speaks for itself.',
      },
    ],
    tech: {
      title: 'Built With Modern Tech',
      subtitle: 'Leveraging cutting-edge browser APIs and WebAssembly for native-like performance.',
      stack: ['Next.js 15', 'WebAssembly', 'Web Workers', 'IndexedDB', 'TypeScript', 'Tailwind CSS'],
    },
    stats: [
      { value: '100%', label: 'Client-Side Processing' },
      { value: '0', label: 'Data Uploads Required' },
      { value: '10+', label: 'Privacy-First Tools' },
      { value: '<50ms', label: 'Average Response Time' },
    ],
    cta: {
      title: 'Ready to Try?',
      subtitle: 'Experience the difference of truly private tools.',
      button: 'Explore Tools',
    },
    team: {
      title: 'Open Source',
      description: 'We believe in transparency. Our core tools are open source and auditable.',
    },
  },
  de: {
    hero: {
      badge: 'Über Uns',
      title: 'Datenschutz Sollte',
      titleHighlight: 'Standard Sein',
      subtitle: 'Wir glauben, dass Ihre Daten Ihnen gehören. Deshalb haben wir Tools entwickelt, die vollständig in Ihrem Browser funktionieren — keine Uploads, keine Server, keine Kompromisse.',
    },
    mission: {
      title: 'Unsere Mission',
      description: 'Leistungsstarke digitale Tools zu demokratisieren und dabei die Privatsphäre der Nutzer zu respektieren. Jedes Tool, das wir entwickeln, verarbeitet Daten lokal.',
    },
    values: [
      {
        icon: Shield,
        title: 'Datenschutz Zuerst',
        description: 'Ihre Daten bleiben auf Ihrem Gerät. Immer. Wir sammeln, speichern oder übertragen Ihre Dateien nicht.',
      },
      {
        icon: Zap,
        title: 'Blitzschnell',
        description: 'Keine Upload-Wartezeiten. Die Verarbeitung erfolgt sofort mit der Rechenleistung Ihres Browsers.',
      },
      {
        icon: Globe,
        title: 'Offline Nutzbar',
        description: 'Einmal geladen, funktionieren die meisten Tools ohne Internet. Perfekt für sensible Arbeitsumgebungen.',
      },
      {
        icon: Lock,
        title: 'Zero Trust',
        description: 'Wir haben unsere Architektur so gestaltet, dass Sie uns nicht vertrauen müssen. Der Code spricht für sich.',
      },
    ],
    tech: {
      title: 'Moderne Technologie',
      subtitle: 'Nutzung modernster Browser-APIs und WebAssembly für native Performance.',
      stack: ['Next.js 15', 'WebAssembly', 'Web Workers', 'IndexedDB', 'TypeScript', 'Tailwind CSS'],
    },
    stats: [
      { value: '100%', label: 'Client-seitige Verarbeitung' },
      { value: '0', label: 'Daten-Uploads Nötig' },
      { value: '10+', label: 'Datenschutz-Tools' },
      { value: '<50ms', label: 'Durchschn. Antwortzeit' },
    ],
    cta: {
      title: 'Bereit zum Testen?',
      subtitle: 'Erleben Sie den Unterschied wirklich privater Tools.',
      button: 'Tools Entdecken',
    },
    team: {
      title: 'Open Source',
      description: 'Wir glauben an Transparenz. Unsere Kern-Tools sind Open Source und überprüfbar.',
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutClient({ lng }: AboutClientProps) {
  const t = content[lng];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-400"
            >
              <Sparkles className="h-4 w-4" />
              {t.hero.badge}
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t.hero.title}{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg leading-8 text-zinc-400">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {t.stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3">
              <Heart className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">{t.mission.title}</h2>
            <p className="text-lg text-zinc-400">{t.mission.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
          >
            {t.values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{value.title}</h3>
                  <p className="text-sm text-zinc-400">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 inline-flex rounded-xl bg-zinc-800 p-3">
              <Cpu className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-white">{t.tech.title}</h2>
            <p className="mb-8 text-zinc-400">{t.tech.subtitle}</p>

            <div className="flex flex-wrap justify-center gap-3">
              {t.tech.stack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex rounded-xl bg-zinc-800 p-3">
              <Github className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">{t.team.title}</h2>
            <p className="mb-8 text-zinc-400">{t.team.description}</p>

            <div className="flex justify-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                <Twitter className="h-5 w-5" />
                Twitter
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-12 text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-white">{t.cta.title}</h2>
            <p className="mb-8 text-zinc-400">{t.cta.subtitle}</p>

            <Link
              href={`/${lng}`}
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/40"
            >
              {t.cta.button}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
