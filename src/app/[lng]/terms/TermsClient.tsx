'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, CreditCard, Scale, Mail } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface TermsClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: January 2026',
    intro: 'Welcome to PureTools AI. By using our services, you agree to these terms. We\'ve kept them simple and fair.',
    sections: [
      {
        icon: CheckCircle,
        title: '1. Acceptance of Terms',
        content: `By accessing or using PureTools AI, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our services.

**Who can use PureTools AI:**
- You must be at least 13 years old
- You must have the legal capacity to enter into agreements
- You must not be prohibited from using our services under applicable laws`,
      },
      {
        icon: FileText,
        title: '2. Service Description',
        content: `PureTools AI provides two categories of tools:

**Free Local Tools:**
- Process files entirely in your browser
- No account required
- Unlimited usage
- Always free

**AI-Powered Tools (Credit-based):**
- Require an account
- Use cloud AI processing
- Consume credits per operation
- Subject to fair use policies

We reserve the right to modify, suspend, or discontinue any service at any time.`,
      },
      {
        icon: CreditCard,
        title: '3. Payments & Credits',
        content: `**Credit System:**
- Credits are purchased in advance
- Credits do not expire for 12 months
- Unused credits from subscriptions roll over for up to 3 months
- No refunds for used credits

**Subscriptions:**
- Billed monthly or annually
- Cancel anytime, effective at period end
- No partial refunds for unused subscription time
- Price changes announced 30 days in advance

**Refund Policy:**
- Full refund within 7 days if no credits used
- Pro-rated refund for technical issues on our end`,
      },
      {
        icon: AlertCircle,
        title: '4. Acceptable Use',
        content: `You agree NOT to use PureTools AI to:

**Prohibited Activities:**
- Process illegal content
- Violate intellectual property rights
- Distribute malware or harmful code
- Attempt to reverse engineer our services
- Abuse API rate limits or circumvent restrictions
- Create competing products using our tools
- Harass, abuse, or harm others

**AI Tool Restrictions:**
- No bulk automated processing without approval
- No generation of harmful or deceptive content
- Compliance with AI provider terms (Google, OpenAI)

Violations may result in immediate account termination.`,
      },
      {
        icon: Scale,
        title: '5. Intellectual Property',
        content: `**Your Content:**
- You retain all rights to files you process
- You grant us no rights to your content
- Local tools never transmit your files to us

**Our Content:**
- PureTools AI brand, code, and design are our property
- You may not copy, modify, or redistribute our software
- Open source components are subject to their respective licenses

**Output Ownership:**
- QR codes, compressed images, etc. are yours
- AI-generated translations/transcriptions are yours to use`,
      },
      {
        icon: FileText,
        title: '6. Disclaimers & Limitations',
        content: `**Service Provided "As Is":**
- No guarantee of uptime or availability
- No warranty of fitness for particular purpose
- Results may vary based on input quality

**Limitation of Liability:**
- We are not liable for indirect or consequential damages
- Maximum liability limited to fees paid in last 12 months
- We are not responsible for third-party AI provider issues

**Local Tool Disclaimer:**
- Processing happens on your device
- We cannot recover lost or corrupted files
- Always maintain backups of important files`,
      },
      {
        icon: Mail,
        title: '7. Contact & Disputes',
        content: `**Contact Us:**
- General inquiries: hello@puretools.ai
- Legal matters: legal@puretools.ai
- Support: support@puretools.ai

**Dispute Resolution:**
- We prefer to resolve issues informally first
- Formal disputes subject to arbitration
- Governing law: [Jurisdiction]

**Changes to Terms:**
- We may update these terms periodically
- Material changes notified via email or site notice
- Continued use constitutes acceptance`,
      },
    ],
  },
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: 'Zuletzt aktualisiert: Januar 2026',
    intro: 'Willkommen bei PureTools AI. Durch die Nutzung unserer Dienste stimmen Sie diesen Bedingungen zu. Wir haben sie einfach und fair gehalten.',
    sections: [
      {
        icon: CheckCircle,
        title: '1. Annahme der Bedingungen',
        content: `Durch den Zugriff auf oder die Nutzung von PureTools AI erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Wenn Sie nicht einverstanden sind, dürfen Sie unsere Dienste nicht nutzen.

**Wer PureTools AI nutzen kann:**
- Sie müssen mindestens 13 Jahre alt sein
- Sie müssen rechtlich geschäftsfähig sein
- Ihnen darf die Nutzung nicht gesetzlich untersagt sein`,
      },
      {
        icon: FileText,
        title: '2. Dienstbeschreibung',
        content: `PureTools AI bietet zwei Kategorien von Tools:

**Kostenlose lokale Tools:**
- Verarbeiten Dateien vollständig in Ihrem Browser
- Kein Account erforderlich
- Unbegrenzte Nutzung
- Immer kostenlos

**KI-gestützte Tools (Credit-basiert):**
- Erfordern einen Account
- Nutzen Cloud-KI-Verarbeitung
- Verbrauchen Credits pro Vorgang
- Unterliegen Fair-Use-Richtlinien

Wir behalten uns das Recht vor, Dienste jederzeit zu ändern, auszusetzen oder einzustellen.`,
      },
      {
        icon: CreditCard,
        title: '3. Zahlungen & Credits',
        content: `**Credit-System:**
- Credits werden im Voraus gekauft
- Credits verfallen nicht für 12 Monate
- Ungenutzte Abo-Credits werden bis zu 3 Monate übertragen
- Keine Rückerstattung für genutzte Credits

**Abonnements:**
- Monatliche oder jährliche Abrechnung
- Jederzeit kündbar, wirksam zum Periodenende
- Keine anteilige Rückerstattung für ungenutzte Abo-Zeit
- Preisänderungen werden 30 Tage vorher angekündigt

**Rückerstattungsrichtlinie:**
- Volle Rückerstattung innerhalb von 7 Tagen wenn keine Credits genutzt
- Anteilige Rückerstattung bei technischen Problemen unsererseits`,
      },
      {
        icon: AlertCircle,
        title: '4. Akzeptable Nutzung',
        content: `Sie verpflichten sich, PureTools AI NICHT zu nutzen für:

**Verbotene Aktivitäten:**
- Verarbeitung illegaler Inhalte
- Verletzung geistiger Eigentumsrechte
- Verbreitung von Malware oder schädlichem Code
- Reverse Engineering unserer Dienste
- Missbrauch von API-Limits oder Umgehung von Beschränkungen
- Erstellung konkurrierender Produkte mit unseren Tools
- Belästigung, Missbrauch oder Schädigung anderer

**KI-Tool-Einschränkungen:**
- Keine automatisierte Massenverarbeitung ohne Genehmigung
- Keine Generierung schädlicher oder irreführender Inhalte
- Einhaltung der KI-Anbieter-Bedingungen (Google, OpenAI)

Verstöße können zur sofortigen Kontosperrung führen.`,
      },
      {
        icon: Scale,
        title: '5. Geistiges Eigentum',
        content: `**Ihre Inhalte:**
- Sie behalten alle Rechte an Ihren verarbeiteten Dateien
- Sie gewähren uns keine Rechte an Ihren Inhalten
- Lokale Tools übertragen Ihre Dateien nie an uns

**Unsere Inhalte:**
- PureTools AI Marke, Code und Design sind unser Eigentum
- Sie dürfen unsere Software nicht kopieren, ändern oder weiterverbreiten
- Open-Source-Komponenten unterliegen ihren jeweiligen Lizenzen

**Eigentum an Ausgaben:**
- QR-Codes, komprimierte Bilder usw. gehören Ihnen
- KI-generierte Übersetzungen/Transkriptionen dürfen Sie frei nutzen`,
      },
      {
        icon: FileText,
        title: '6. Haftungsausschluss & Beschränkungen',
        content: `**Dienst wird "wie besehen" bereitgestellt:**
- Keine Garantie für Verfügbarkeit oder Betriebszeit
- Keine Gewährleistung für bestimmte Zwecke
- Ergebnisse können je nach Eingabequalität variieren

**Haftungsbeschränkung:**
- Wir haften nicht für indirekte oder Folgeschäden
- Maximale Haftung begrenzt auf Gebühren der letzten 12 Monate
- Wir sind nicht verantwortlich für Probleme bei KI-Drittanbietern

**Haftungsausschluss für lokale Tools:**
- Verarbeitung erfolgt auf Ihrem Gerät
- Wir können verlorene oder beschädigte Dateien nicht wiederherstellen
- Pflegen Sie immer Backups wichtiger Dateien`,
      },
      {
        icon: Mail,
        title: '7. Kontakt & Streitigkeiten',
        content: `**Kontaktieren Sie uns:**
- Allgemeine Anfragen: hello@puretools.ai
- Rechtliche Angelegenheiten: legal@puretools.ai
- Support: support@puretools.ai

**Streitbeilegung:**
- Wir bevorzugen informelle Lösungen
- Formelle Streitigkeiten unterliegen Schlichtung
- Anwendbares Recht: [Gerichtsstand]

**Änderungen der Bedingungen:**
- Wir können diese Bedingungen regelmäßig aktualisieren
- Wesentliche Änderungen werden per E-Mail oder Hinweis mitgeteilt
- Fortgesetzte Nutzung gilt als Zustimmung`,
      },
    ],
  },
};

export default function TermsClient({ lng }: TermsClientProps) {
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

        <div className="space-y-8">
          {t.sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2">
                    <Icon className="h-6 w-6 text-emerald-400" />
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
