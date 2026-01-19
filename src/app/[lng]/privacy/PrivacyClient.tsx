'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Server, Cookie, Mail, Calendar } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface PrivacyClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 2026',
    intro: 'At PureTools AI, privacy is not just a feature — it\'s our foundation. This policy explains how we handle your data (spoiler: we don\'t collect it).',
    sections: [
      {
        icon: Shield,
        title: 'Our Privacy Promise',
        content: `PureTools AI is built on a simple principle: your data belongs to you. Our local tools process everything directly in your browser. No uploads, no servers, no data collection.

**What this means for you:**
- Your files never leave your device
- We cannot see what you process
- No account required for local tools
- Works completely offline once loaded`,
      },
      {
        icon: Eye,
        title: 'Data We Don\'t Collect',
        content: `For our local tools, we collect absolutely nothing:
- No file contents
- No usage patterns
- No personal information
- No device fingerprints
- No tracking cookies

**For AI-powered tools:** When you use our cloud AI features (translation, transcription), your data is processed by our AI providers (Google Gemini, OpenAI) and is not stored after processing.`,
      },
      {
        icon: Server,
        title: 'How Local Processing Works',
        content: `Our tools use modern browser technologies to process your files locally:

- **WebAssembly (WASM):** Native-speed processing in your browser
- **Web Workers:** Background processing without blocking your browser
- **IndexedDB:** Local storage that never syncs to our servers
- **Client-side JavaScript:** All logic runs on your device

This architecture ensures that sensitive documents, images, and audio files never touch our infrastructure.`,
      },
      {
        icon: Cookie,
        title: 'Cookies & Analytics',
        content: `**Essential cookies only:** We use minimal cookies for:
- Language preference (to remember DE/EN selection)
- Session management (for logged-in users only)

**Analytics:** We use privacy-friendly analytics that:
- Don't track individual users
- Don't use cookies
- Only collect aggregate page views
- Are fully GDPR compliant`,
      },
      {
        icon: Mail,
        title: 'AI Features & Third Parties',
        content: `When using AI-powered features, data is processed by:

**Google Gemini API** (for translation):
- Data is processed and immediately discarded
- Not used for model training
- Subject to Google's AI privacy policy

**OpenAI Whisper API** (for transcription):
- Audio is processed and not retained
- Not used for model training
- Subject to OpenAI's API data policy

We recommend reviewing their privacy policies for complete details.`,
      },
      {
        icon: Calendar,
        title: 'Your Rights',
        content: `Under GDPR and similar regulations, you have the right to:

- **Access:** Request what data we have (for local tools: none)
- **Deletion:** Request removal of any account data
- **Portability:** Export your data in standard formats
- **Objection:** Opt out of any data processing

Since we don't collect data from local tool usage, most requests are automatically fulfilled by design.

**Contact for privacy inquiries:** privacy@puretools.ai`,
      },
    ],
  },
  de: {
    title: 'Datenschutzerklärung',
    lastUpdated: 'Zuletzt aktualisiert: Januar 2026',
    intro: 'Bei PureTools AI ist Datenschutz nicht nur ein Feature — er ist unser Fundament. Diese Richtlinie erklärt, wie wir mit Ihren Daten umgehen (Spoiler: Wir sammeln sie nicht).',
    sections: [
      {
        icon: Shield,
        title: 'Unser Datenschutz-Versprechen',
        content: `PureTools AI basiert auf einem einfachen Prinzip: Ihre Daten gehören Ihnen. Unsere lokalen Tools verarbeiten alles direkt in Ihrem Browser. Keine Uploads, keine Server, keine Datenerfassung.

**Was das für Sie bedeutet:**
- Ihre Dateien verlassen nie Ihr Gerät
- Wir können nicht sehen, was Sie verarbeiten
- Kein Account für lokale Tools erforderlich
- Funktioniert komplett offline nach dem Laden`,
      },
      {
        icon: Eye,
        title: 'Daten, die wir nicht sammeln',
        content: `Für unsere lokalen Tools sammeln wir absolut nichts:
- Keine Dateiinhalte
- Keine Nutzungsmuster
- Keine persönlichen Informationen
- Keine Geräte-Fingerprints
- Keine Tracking-Cookies

**Für KI-Tools:** Wenn Sie unsere Cloud-KI-Funktionen nutzen (Übersetzung, Transkription), werden Ihre Daten von unseren KI-Anbietern (Google Gemini, OpenAI) verarbeitet und nach der Verarbeitung nicht gespeichert.`,
      },
      {
        icon: Server,
        title: 'Wie lokale Verarbeitung funktioniert',
        content: `Unsere Tools nutzen moderne Browser-Technologien zur lokalen Verarbeitung:

- **WebAssembly (WASM):** Native Geschwindigkeit im Browser
- **Web Workers:** Hintergrundverarbeitung ohne Browser-Blockierung
- **IndexedDB:** Lokaler Speicher ohne Server-Sync
- **Client-seitiges JavaScript:** Alle Logik läuft auf Ihrem Gerät

Diese Architektur stellt sicher, dass sensible Dokumente, Bilder und Audiodateien nie unsere Infrastruktur berühren.`,
      },
      {
        icon: Cookie,
        title: 'Cookies & Analysen',
        content: `**Nur essenzielle Cookies:** Wir verwenden minimale Cookies für:
- Spracheinstellung (DE/EN Auswahl merken)
- Session-Verwaltung (nur für eingeloggte Nutzer)

**Analysen:** Wir nutzen datenschutzfreundliche Analysen, die:
- Keine einzelnen Nutzer tracken
- Keine Cookies verwenden
- Nur aggregierte Seitenaufrufe erfassen
- Vollständig DSGVO-konform sind`,
      },
      {
        icon: Mail,
        title: 'KI-Funktionen & Drittanbieter',
        content: `Bei Nutzung von KI-Funktionen werden Daten verarbeitet von:

**Google Gemini API** (für Übersetzung):
- Daten werden verarbeitet und sofort verworfen
- Nicht für Modell-Training verwendet
- Unterliegt Googles KI-Datenschutzrichtlinie

**OpenAI Whisper API** (für Transkription):
- Audio wird verarbeitet und nicht gespeichert
- Nicht für Modell-Training verwendet
- Unterliegt OpenAIs API-Datenrichtlinie

Wir empfehlen, deren Datenschutzrichtlinien für vollständige Details zu lesen.`,
      },
      {
        icon: Calendar,
        title: 'Ihre Rechte',
        content: `Nach DSGVO und ähnlichen Vorschriften haben Sie das Recht auf:

- **Auskunft:** Anfrage welche Daten wir haben (bei lokalen Tools: keine)
- **Löschung:** Entfernung jeglicher Account-Daten
- **Datenübertragbarkeit:** Export Ihrer Daten in Standardformaten
- **Widerspruch:** Opt-out aus jeglicher Datenverarbeitung

Da wir keine Daten aus der Nutzung lokaler Tools sammeln, werden die meisten Anfragen automatisch durch Design erfüllt.

**Kontakt für Datenschutzanfragen:** privacy@puretools.ai`,
      },
    ],
  },
};

export default function PrivacyClient({ lng }: PrivacyClientProps) {
  const t = content[lng];

  return (
    <div className="min-h-screen py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="mb-4 text-4xl font-bold text-white">{t.title}</h1>
          <p className="mb-4 text-sm text-zinc-500">{t.lastUpdated}</p>
          <p className="text-lg text-zinc-400">{t.intro}</p>
        </motion.div>

        <div className="space-y-12">
          {t.sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-500/10 p-2">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                </div>
                <div className="prose prose-invert prose-zinc max-w-none">
                  {section.content.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="mb-4 text-zinc-400 whitespace-pre-line">
                      {paragraph.split('**').map((part, partIndex) =>
                        partIndex % 2 === 1 ? (
                          <strong key={partIndex} className="text-white">{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
