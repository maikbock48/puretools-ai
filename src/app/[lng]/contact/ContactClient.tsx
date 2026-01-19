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
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface ContactClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Get in Touch',
    subtitle: 'Have a question, feedback, or just want to say hi? We\'d love to hear from you.',
    form: {
      name: 'Your Name',
      email: 'Email Address',
      subject: 'Subject',
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
        title: 'Email',
        general: 'General inquiries',
        support: 'Technical support',
        business: 'Business & partnerships',
      },
      social: {
        title: 'Social',
        github: 'Star us on GitHub',
        twitter: 'Follow for updates',
      },
      response: {
        title: 'Response Time',
        text: 'We typically respond within 24-48 hours during business days.',
      },
    },
    faq: {
      title: 'Quick Answers',
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
    title: 'Kontaktieren Sie uns',
    subtitle: 'Haben Sie eine Frage, Feedback oder möchten einfach Hallo sagen? Wir freuen uns von Ihnen zu hören.',
    form: {
      name: 'Ihr Name',
      email: 'E-Mail-Adresse',
      subject: 'Betreff',
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
        title: 'Social Media',
        github: 'Stern auf GitHub',
        twitter: 'Folgen für Updates',
      },
      response: {
        title: 'Antwortzeit',
        text: 'Wir antworten in der Regel innerhalb von 24-48 Stunden an Werktagen.',
      },
    },
    faq: {
      title: 'Schnelle Antworten',
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
      <div className="min-h-screen py-24">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-12"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">{t.form.success}</h2>
            <p className="text-zinc-400">{t.form.successSub}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3">
            <MessageSquare className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">{t.subtitle}</p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {t.form.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    {t.form.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
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
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  {t.form.message}
                </label>
                <textarea
                  required
                  rows={6}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder={t.form.messagePlaceholder}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  t.form.sending
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {t.form.submit}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* Email Contacts */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <Mail className="h-5 w-5 text-indigo-400" />
                {t.contact.email.title}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-zinc-500">{t.contact.email.general}</div>
                  <a href="mailto:hello@puretools.ai" className="text-white hover:text-indigo-400">
                    hello@puretools.ai
                  </a>
                </div>
                <div>
                  <div className="text-zinc-500">{t.contact.email.support}</div>
                  <a href="mailto:support@puretools.ai" className="text-white hover:text-indigo-400">
                    support@puretools.ai
                  </a>
                </div>
                <div>
                  <div className="text-zinc-500">{t.contact.email.business}</div>
                  <a href="mailto:business@puretools.ai" className="text-white hover:text-indigo-400">
                    business@puretools.ai
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 font-semibold text-white">{t.contact.social.title}</h3>
              <div className="space-y-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg bg-zinc-800 p-3 text-sm text-white transition-colors hover:bg-zinc-700"
                >
                  <Github className="h-5 w-5" />
                  {t.contact.social.github}
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg bg-zinc-800 p-3 text-sm text-white transition-colors hover:bg-zinc-700"
                >
                  <Twitter className="h-5 w-5" />
                  {t.contact.social.twitter}
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-2 font-semibold text-white">{t.contact.response.title}</h3>
              <p className="text-sm text-zinc-400">{t.contact.response.text}</p>
            </div>

            {/* Quick FAQ */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <h3 className="mb-4 font-semibold text-white">{t.faq.title}</h3>
              <div className="space-y-4">
                {t.faq.items.map((item, index) => (
                  <div key={index}>
                    <div className="text-sm font-medium text-white">{item.q}</div>
                    <div className="mt-1 text-sm text-zinc-500">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
