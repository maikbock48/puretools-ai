'use client';

import { motion } from 'framer-motion';
import { Scale, Mail, MapPin, Phone, Globe, Building2 } from 'lucide-react';
import { Language } from '@/i18n/settings';

interface ImpressumClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Legal Notice',
    subtitle: 'Information according to § 5 TMG (German Telemedia Act)',
    sections: {
      company: {
        title: 'Company Information',
        name: 'PureTools AI',
        type: 'Software Development',
        address: {
          street: '[Street Address]',
          city: '[City, Postal Code]',
          country: 'Germany',
        },
      },
      contact: {
        title: 'Contact',
        email: 'hello@puretools.ai',
        phone: '[Phone Number]',
        website: 'https://puretools.ai',
      },
      representative: {
        title: 'Represented by',
        name: '[Managing Director Name]',
        role: 'Managing Director',
      },
      register: {
        title: 'Commercial Register',
        court: '[Local Court]',
        number: '[HRB Number]',
        vatId: 'VAT ID: [DE Number]',
      },
      responsibility: {
        title: 'Responsible for Content',
        text: 'According to § 55 Abs. 2 RStV:',
        name: '[Name]',
        address: '[Address]',
      },
      dispute: {
        title: 'EU Dispute Resolution',
        text: 'The European Commission provides a platform for online dispute resolution (OS):',
        link: 'https://ec.europa.eu/consumers/odr',
        note: 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.',
      },
      liability: {
        title: 'Liability for Content',
        text: `As a service provider, we are responsible for our own content on these pages according to § 7 Abs.1 TMG. According to §§ 8 to 10 TMG, however, we are not obligated as a service provider to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.

Obligations to remove or block the use of information according to general laws remain unaffected. However, liability in this regard is only possible from the time of knowledge of a specific legal violation. Upon becoming aware of such violations, we will remove this content immediately.`,
      },
      links: {
        title: 'Liability for Links',
        text: `Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the content of the linked pages.

The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking. However, permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of a violation. Upon becoming aware of legal violations, we will remove such links immediately.`,
      },
      copyright: {
        title: 'Copyright',
        text: `The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution and any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator.

Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected.`,
      },
    },
  },
  de: {
    title: 'Impressum',
    subtitle: 'Angaben gemäß § 5 TMG',
    sections: {
      company: {
        title: 'Unternehmensangaben',
        name: 'PureTools AI',
        type: 'Softwareentwicklung',
        address: {
          street: '[Straße und Hausnummer]',
          city: '[PLZ und Ort]',
          country: 'Deutschland',
        },
      },
      contact: {
        title: 'Kontakt',
        email: 'hello@puretools.ai',
        phone: '[Telefonnummer]',
        website: 'https://puretools.ai',
      },
      representative: {
        title: 'Vertreten durch',
        name: '[Name des Geschäftsführers]',
        role: 'Geschäftsführer',
      },
      register: {
        title: 'Handelsregister',
        court: '[Amtsgericht]',
        number: '[HRB-Nummer]',
        vatId: 'USt-IdNr.: [DE-Nummer]',
      },
      responsibility: {
        title: 'Verantwortlich für den Inhalt',
        text: 'Nach § 55 Abs. 2 RStV:',
        name: '[Name]',
        address: '[Adresse]',
      },
      dispute: {
        title: 'EU-Streitschlichtung',
        text: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:',
        link: 'https://ec.europa.eu/consumers/odr',
        note: 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      },
      liability: {
        title: 'Haftung für Inhalte',
        text: `Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.

Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.`,
      },
      links: {
        title: 'Haftung für Links',
        text: `Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.`,
      },
      copyright: {
        title: 'Urheberrecht',
        text: `Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.`,
      },
    },
  },
};

export default function ImpressumClient({ lng }: ImpressumClientProps) {
  const t = content[lng];

  return (
    <div className="min-h-screen py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3">
            <Scale className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">{t.title}</h1>
          <p className="text-lg text-zinc-400">{t.subtitle}</p>
        </motion.div>

        <div className="space-y-8">
          {/* Company Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-2">
                <Building2 className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">{t.sections.company.title}</h2>
            </div>
            <div className="space-y-2 text-zinc-400">
              <p className="text-lg font-medium text-white">{t.sections.company.name}</p>
              <p>{t.sections.company.type}</p>
              <div className="mt-4 flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 text-zinc-500" />
                <div>
                  <p>{t.sections.company.address.street}</p>
                  <p>{t.sections.company.address.city}</p>
                  <p>{t.sections.company.address.country}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2">
                <Mail className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">{t.sections.contact.title}</h2>
            </div>
            <div className="space-y-3 text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-500" />
                <a href={`mailto:${t.sections.contact.email}`} className="hover:text-indigo-400">
                  {t.sections.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-500" />
                <span>{t.sections.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-zinc-500" />
                <a href={t.sections.contact.website} className="hover:text-indigo-400">
                  {t.sections.contact.website}
                </a>
              </div>
            </div>
          </motion.section>

          {/* Representative */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.representative.title}</h2>
            <div className="text-zinc-400">
              <p className="font-medium text-white">{t.sections.representative.name}</p>
              <p>{t.sections.representative.role}</p>
            </div>
          </motion.section>

          {/* Register */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.register.title}</h2>
            <div className="space-y-1 text-zinc-400">
              <p>{t.sections.register.court}</p>
              <p>{t.sections.register.number}</p>
              <p className="mt-2">{t.sections.register.vatId}</p>
            </div>
          </motion.section>

          {/* Responsibility */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.responsibility.title}</h2>
            <div className="text-zinc-400">
              <p className="mb-2">{t.sections.responsibility.text}</p>
              <p className="font-medium text-white">{t.sections.responsibility.name}</p>
              <p>{t.sections.responsibility.address}</p>
            </div>
          </motion.section>

          {/* EU Dispute */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.dispute.title}</h2>
            <div className="text-zinc-400">
              <p className="mb-2">{t.sections.dispute.text}</p>
              <a
                href={t.sections.dispute.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                {t.sections.dispute.link}
              </a>
              <p className="mt-4">{t.sections.dispute.note}</p>
            </div>
          </motion.section>

          {/* Liability for Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.liability.title}</h2>
            <p className="whitespace-pre-line text-zinc-400">{t.sections.liability.text}</p>
          </motion.section>

          {/* Liability for Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.links.title}</h2>
            <p className="whitespace-pre-line text-zinc-400">{t.sections.links.text}</p>
          </motion.section>

          {/* Copyright */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8"
          >
            <h2 className="mb-4 text-xl font-semibold text-white">{t.sections.copyright.title}</h2>
            <p className="whitespace-pre-line text-zinc-400">{t.sections.copyright.text}</p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
