'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MessageSquare,
  Send,
  Github,
  Twitter,
  CheckCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  Building,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface ContactClientProps {
  lng: Language;
}

const content = {
  en: {
    hero: {
      badge: 'Contact Us',
      title: 'Let\'s Start a',
      titleHighlight: 'Conversation',
      subtitle: 'Have a question, feedback, or just want to say hi? We\'re here to help and would love to hear from you.',
    },
    form: {
      name: 'Your Name',
      namePlaceholder: 'John Doe',
      email: 'Email Address',
      emailPlaceholder: 'john@example.com',
      subject: 'What can we help with?',
      subjectOptions: [
        { value: 'general', label: 'General Inquiry', icon: HelpCircle },
        { value: 'support', label: 'Technical Support', icon: Bug },
        { value: 'feature', label: 'Feature Request', icon: Lightbulb },
        { value: 'business', label: 'Business Inquiry', icon: Building },
      ],
      message: 'Your Message',
      messagePlaceholder: 'Tell us what\'s on your mind...',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      successSub: 'We\'ll get back to you within 24-48 hours.',
    },
    contact: {
      title: 'Other Ways to Reach Us',
      email: {
        title: 'Email Us',
        general: 'General inquiries',
        support: 'Technical support',
        business: 'Business & partnerships',
      },
      social: {
        title: 'Follow Us',
        github: 'Star us on GitHub',
        twitter: 'Follow for updates',
      },
      response: {
        title: 'Response Time',
        text: 'We typically respond within 24-48 hours during business days. For urgent issues, please use technical support.',
      },
      location: {
        title: 'Location',
        text: 'Remote-first company serving users worldwide',
      },
    },
    faq: {
      title: 'Frequently Asked',
      items: [
        {
          q: 'Is support available for free tools?',
          a: 'Yes! We provide community support for all users, free or paid.',
        },
        {
          q: 'How do I report a bug?',
          a: 'Use the contact form with "Technical Support" selected, or open an issue on GitHub.',
        },
        {
          q: 'Can I request a new tool?',
          a: 'Absolutely! Select "Feature Request" and tell us what you need.',
        },
      ],
    },
  },
  de: {
    hero: {
      badge: 'Kontakt',
      title: 'Lassen Sie uns',
      titleHighlight: 'Sprechen',
      subtitle: 'Haben Sie eine Frage, Feedback oder möchten einfach Hallo sagen? Wir sind für Sie da und freuen uns von Ihnen zu hören.',
    },
    form: {
      name: 'Ihr Name',
      namePlaceholder: 'Max Mustermann',
      email: 'E-Mail-Adresse',
      emailPlaceholder: 'max@beispiel.de',
      subject: 'Wie können wir helfen?',
      subjectOptions: [
        { value: 'general', label: 'Allgemeine Anfrage', icon: HelpCircle },
        { value: 'support', label: 'Technischer Support', icon: Bug },
        { value: 'feature', label: 'Feature-Anfrage', icon: Lightbulb },
        { value: 'business', label: 'Geschäftliche Anfrage', icon: Building },
      ],
      message: 'Ihre Nachricht',
      messagePlaceholder: 'Teilen Sie uns mit, was Sie beschäftigt...',
      submit: 'Nachricht senden',
      sending: 'Wird gesendet...',
      success: 'Nachricht erfolgreich gesendet!',
      successSub: 'Wir melden uns innerhalb von 24-48 Stunden.',
    },
    contact: {
      title: 'Weitere Kontaktmöglichkeiten',
      email: {
        title: 'E-Mail',
        general: 'Allgemeine Anfragen',
        support: 'Technischer Support',
        business: 'Geschäft & Partnerschaften',
      },
      social: {
        title: 'Folgen Sie uns',
        github: 'Stern auf GitHub',
        twitter: 'Folgen für Updates',
      },
      response: {
        title: 'Antwortzeit',
        text: 'Wir antworten in der Regel innerhalb von 24-48 Stunden an Werktagen. Bei dringenden Problemen nutzen Sie bitte den technischen Support.',
      },
      location: {
        title: 'Standort',
        text: 'Remote-First Unternehmen für Nutzer weltweit',
      },
    },
    faq: {
      title: 'Häufig gefragt',
      items: [
        {
          q: 'Gibt es Support für kostenlose Tools?',
          a: 'Ja! Wir bieten Community-Support für alle Nutzer, kostenlos oder bezahlt.',
        },
        {
          q: 'Wie melde ich einen Fehler?',
          a: 'Nutzen Sie das Kontaktformular mit "Technischer Support" oder eröffnen Sie ein Issue auf GitHub.',
        },
        {
          q: 'Kann ich ein neues Tool anfragen?',
          a: 'Auf jeden Fall! Wählen Sie "Feature-Anfrage" und beschreiben Sie was Sie brauchen.',
        },
      ],
    },
  },
};

export default function ContactClient({ lng }: ContactClientProps) {
  const t = content[lng];
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSuccess(true);
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-12"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">{t.form.success}</h2>
            <p className="text-zinc-600 dark:text-zinc-400">{t.form.successSub}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
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

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
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
            <div className="h-[500px] w-[500px] rounded-full bg-indigo-100 dark:bg-indigo-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t.form.name}
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder={t.form.namePlaceholder}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t.form.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder={t.form.emailPlaceholder}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t.form.subject}
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {t.form.subjectOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormState({ ...formState, subject: option.value })}
                            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                              formState.subject === option.value
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium text-center">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {t.form.message}
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder={t.form.messagePlaceholder}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t.form.sending}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {t.form.submit}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 lg:col-span-2"
            >
              {/* Email Contacts */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <div className="rounded-lg bg-indigo-100 dark:bg-indigo-500/10 p-2">
                    <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {t.contact.email.title}
                </h3>
                <div className="space-y-4">
                  <div className="group">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t.contact.email.general}</div>
                    <a href="mailto:hello@puretools.ai" className="text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                      hello@puretools.ai
                    </a>
                  </div>
                  <div className="group">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t.contact.email.support}</div>
                    <a href="mailto:support@puretools.ai" className="text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                      support@puretools.ai
                    </a>
                  </div>
                  <div className="group">
                    <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{t.contact.email.business}</div>
                    <a href="mailto:business@puretools.ai" className="text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                      business@puretools.ai
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">{t.contact.social.title}</h3>
                <div className="space-y-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-sm text-zinc-700 dark:text-white transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <Github className="h-5 w-5" />
                    {t.contact.social.github}
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-sm text-zinc-700 dark:text-white transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <Twitter className="h-5 w-5" />
                    {t.contact.social.twitter}
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  {t.contact.response.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.contact.response.text}</p>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  {t.contact.location.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.contact.location.text}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t.faq.title}</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{item.q}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
