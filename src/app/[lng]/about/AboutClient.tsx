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
  Ban,
  Infinity,
  Users,
  Wrench,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { Language } from '@/i18n/settings';

interface AboutClientProps {
  lng: Language;
}

const content = {
  en: {
    hero: {
      badge: 'About PureTools',
      title: 'Your All-in-One',
      titleHighlight: 'Productivity Hub',
      subtitle: 'We\'ve built a comprehensive collection of professional-grade tools that respect your privacy. Most are completely free, run locally in your browser, and contain zero advertisements.',
    },
    promise: {
      title: 'Our Promise',
      items: [
        {
          icon: Ban,
          title: 'No Advertisements',
          description: 'We believe productivity tools should be distraction-free. You won\'t find any ads, pop-ups, or promotional banners interrupting your workflow.',
        },
        {
          icon: Infinity,
          title: 'Unlimited Free Usage',
          description: 'The majority of our tools are completely free with no usage limits. Process as many files as you need without hitting paywalls.',
        },
        {
          icon: Shield,
          title: 'Privacy by Design',
          description: 'Your files are processed locally in your browser. Nothing is uploaded to our servers, ensuring complete confidentiality of your data.',
        },
      ],
    },
    mission: {
      title: 'Our Mission',
      description: 'To provide professionals, creators, and everyday users with a reliable toolkit that enhances productivity without compromising privacy or demanding subscription fees.',
      vision: 'We envision a web where powerful tools are accessible to everyone, regardless of budget or technical expertise.',
    },
    why: {
      title: 'Why PureTools?',
      subtitle: 'In a landscape of fragmented online tools, we offer a unified platform designed for efficiency.',
      reasons: [
        {
          icon: Target,
          title: 'Purpose-Built',
          description: 'Each tool is meticulously crafted to solve real problems. No bloat, no unnecessary features.',
        },
        {
          icon: Clock,
          title: 'Instant Processing',
          description: 'Local processing means zero upload wait times. Your files are converted in milliseconds.',
        },
        {
          icon: Users,
          title: 'User-Centric Design',
          description: 'Intuitive interfaces that require no learning curve. Get results in seconds, not hours.',
        },
        {
          icon: TrendingUp,
          title: 'Constantly Evolving',
          description: 'We regularly add new tools based on user feedback and emerging productivity needs.',
        },
      ],
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
        title: 'Zero Trust Architecture',
        description: 'We designed our system so you don\'t have to trust us. The code speaks for itself.',
      },
    ],
    tech: {
      title: 'Enterprise-Grade Technology',
      subtitle: 'Built with modern web technologies that deliver native-like performance and reliability.',
      stack: ['Next.js 16', 'WebAssembly', 'Web Workers', 'IndexedDB', 'TypeScript', 'Tailwind CSS'],
    },
    stats: [
      { value: '100%', label: 'Local Processing' },
      { value: '0', label: 'Ads & Tracking' },
      { value: '15+', label: 'Professional Tools' },
      { value: '<50ms', label: 'Avg. Response Time' },
    ],
    tools: {
      title: 'Comprehensive Toolkit',
      subtitle: 'From document conversion to media editing, we\'ve got you covered.',
      categories: [
        { name: 'Document Tools', items: ['PDF Toolkit', 'PDF to JPG', 'OCR', 'JSON Formatter'] },
        { name: 'Image Processing', items: ['Image Compressor', 'HEIC Converter', 'Background Remover', 'Sticker Maker'] },
        { name: 'Media & Audio', items: ['Video Trimmer', 'Audio Cutter', 'Audio Converter'] },
        { name: 'QR & Utilities', items: ['QR Studio', 'WiFi QR', 'Business Card QR', 'BAC Calculator'] },
      ],
    },
    cta: {
      title: 'Ready to Boost Your Productivity?',
      subtitle: 'Join thousands of professionals who trust PureTools for their daily workflow.',
      button: 'Explore All Tools',
    },
    team: {
      title: 'Transparent & Open',
      description: 'We believe in transparency. Our development process is guided by user feedback, and we\'re committed to keeping our core tools free forever.',
    },
  },
  de: {
    hero: {
      badge: 'Über PureTools',
      title: 'Ihr All-in-One',
      titleHighlight: 'Produktivitäts-Hub',
      subtitle: 'Wir haben eine umfassende Sammlung professioneller Tools entwickelt, die Ihre Privatsphäre respektieren. Die meisten sind komplett kostenlos, laufen lokal in Ihrem Browser und enthalten keinerlei Werbung.',
    },
    promise: {
      title: 'Unser Versprechen',
      items: [
        {
          icon: Ban,
          title: 'Keine Werbung',
          description: 'Produktivitätstools sollten ablenkungsfrei sein. Bei uns finden Sie keine Anzeigen, Pop-ups oder Werbebanner, die Ihren Workflow unterbrechen.',
        },
        {
          icon: Infinity,
          title: 'Unbegrenzt Kostenlos',
          description: 'Die Mehrheit unserer Tools ist komplett kostenlos ohne Nutzungslimits. Verarbeiten Sie so viele Dateien wie nötig ohne Paywalls.',
        },
        {
          icon: Shield,
          title: 'Privacy by Design',
          description: 'Ihre Dateien werden lokal in Ihrem Browser verarbeitet. Nichts wird auf unsere Server hochgeladen – vollständige Vertraulichkeit garantiert.',
        },
      ],
    },
    mission: {
      title: 'Unsere Mission',
      description: 'Profis, Kreative und alltägliche Nutzer mit einem zuverlässigen Toolkit zu versorgen, das Produktivität steigert ohne Kompromisse bei Datenschutz oder Abo-Gebühren.',
      vision: 'Wir streben eine Web-Welt an, in der leistungsstarke Tools für jeden zugänglich sind – unabhängig von Budget oder technischem Know-how.',
    },
    why: {
      title: 'Warum PureTools?',
      subtitle: 'In einer Landschaft fragmentierter Online-Tools bieten wir eine einheitliche Plattform für maximale Effizienz.',
      reasons: [
        {
          icon: Target,
          title: 'Zweckgebaut',
          description: 'Jedes Tool ist sorgfältig entwickelt, um echte Probleme zu lösen. Kein Bloat, keine unnötigen Features.',
        },
        {
          icon: Clock,
          title: 'Sofortige Verarbeitung',
          description: 'Lokale Verarbeitung bedeutet null Wartezeit beim Upload. Ihre Dateien werden in Millisekunden konvertiert.',
        },
        {
          icon: Users,
          title: 'Nutzerorientiertes Design',
          description: 'Intuitive Oberflächen ohne Lernkurve. Ergebnisse in Sekunden, nicht Stunden.',
        },
        {
          icon: TrendingUp,
          title: 'Ständige Weiterentwicklung',
          description: 'Wir fügen regelmäßig neue Tools basierend auf Nutzerfeedback und aktuellen Bedürfnissen hinzu.',
        },
      ],
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
        title: 'Zero Trust Architektur',
        description: 'Wir haben unser System so gestaltet, dass Sie uns nicht vertrauen müssen. Der Code spricht für sich.',
      },
    ],
    tech: {
      title: 'Enterprise-Grade Technologie',
      subtitle: 'Gebaut mit modernen Web-Technologien für native Performance und Zuverlässigkeit.',
      stack: ['Next.js 16', 'WebAssembly', 'Web Workers', 'IndexedDB', 'TypeScript', 'Tailwind CSS'],
    },
    stats: [
      { value: '100%', label: 'Lokale Verarbeitung' },
      { value: '0', label: 'Werbung & Tracking' },
      { value: '15+', label: 'Professionelle Tools' },
      { value: '<50ms', label: 'Durchschn. Antwortzeit' },
    ],
    tools: {
      title: 'Umfassendes Toolkit',
      subtitle: 'Von Dokumentenkonvertierung bis Medienbearbeitung – wir haben alles.',
      categories: [
        { name: 'Dokumenten-Tools', items: ['PDF Toolkit', 'PDF zu JPG', 'OCR', 'JSON Formatter'] },
        { name: 'Bildbearbeitung', items: ['Bildkompressor', 'HEIC Konverter', 'Hintergrund Entferner', 'Sticker Maker'] },
        { name: 'Medien & Audio', items: ['Video Trimmer', 'Audio Cutter', 'Audio Konverter'] },
        { name: 'QR & Utilities', items: ['QR Studio', 'WLAN QR', 'Visitenkarten QR', 'Promillerechner'] },
      ],
    },
    cta: {
      title: 'Bereit für mehr Produktivität?',
      subtitle: 'Schließen Sie sich Tausenden von Profis an, die PureTools für ihren täglichen Workflow vertrauen.',
      button: 'Alle Tools Entdecken',
    },
    team: {
      title: 'Transparent & Offen',
      description: 'Wir glauben an Transparenz. Unsere Entwicklung wird von Nutzerfeedback geleitet, und wir sind verpflichtet, unsere Kern-Tools für immer kostenlos zu halten.',
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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
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
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400"
            >
              <Sparkles className="h-4 w-4" />
              {t.hero.badge}
            </motion.div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              {t.hero.title}{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[600px] w-[600px] rounded-full bg-indigo-100 dark:bg-indigo-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
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
                <div className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{t.promise.title}</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {t.promise.items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-500/5 dark:to-transparent" />
                  <div className="relative">
                    <div className="mb-6 mx-auto inline-flex rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 p-4 text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 p-4">
              <Heart className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">{t.mission.title}</h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">{t.mission.description}</p>
            <p className="text-zinc-500 dark:text-zinc-500 italic">{t.mission.vision}</p>
          </motion.div>
        </div>
      </section>

      {/* Why PureTools Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{t.why.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">{t.why.subtitle}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {t.why.reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3 text-zinc-600 dark:text-zinc-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">{reason.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{reason.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
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
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-100 dark:bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/20 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">{value.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tools Overview Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-violet-100 dark:bg-violet-500/10 p-4">
              <Wrench className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">{t.tools.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">{t.tools.subtitle}</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {t.tools.categories.map((category, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
              >
                <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{category.name}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-zinc-200 dark:bg-zinc-800 p-4">
              <Cpu className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-white">{t.tech.title}</h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">{t.tech.subtitle}</p>

            <div className="flex flex-wrap justify-center gap-3">
              {t.tech.stack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-4">
              <Github className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">{t.team.title}</h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">{t.team.description}</p>

            <div className="flex justify-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-900 dark:text-white transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
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
            className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 p-12 text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-indigo-100 dark:bg-indigo-500/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-100 dark:bg-emerald-500/10 blur-3xl" />
            </div>

            <h2 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">{t.cta.title}</h2>
            <p className="mb-8 text-zinc-600 dark:text-zinc-400">{t.cta.subtitle}</p>

            <Link
              href={`/${lng}#tools`}
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
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
