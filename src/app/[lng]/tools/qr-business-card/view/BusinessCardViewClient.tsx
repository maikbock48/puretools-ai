'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Phone, Mail, Globe, MapPin, Download, UserPlus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Language } from '@/i18n/settings';

interface CardData {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

interface Colors {
  bgColor: string;
  textColor: string;
  accentColor: string;
}

interface BusinessCardViewClientProps {
  lng: Language;
  cardData: CardData;
  colors: Colors;
  photo: string | null;
  error?: string;
}

export default function BusinessCardViewClient({
  lng,
  cardData,
  colors,
  photo,
  error,
}: BusinessCardViewClientProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { bgColor, textColor, accentColor } = colors;

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {lng === 'de' ? 'Fehler' : 'Error'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
          <a
            href={`/${lng}/tools/qr-business-card`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {lng === 'de' ? 'Eigene Visitenkarte erstellen' : 'Create your own business card'}
          </a>
        </div>
      </main>
    );
  }

  const generateVCard = () => {
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${cardData.lastName};${cardData.firstName};;;`,
      `FN:${cardData.firstName} ${cardData.lastName}`,
      `ORG:${cardData.company}`,
      `TITLE:${cardData.title}`,
      `TEL;TYPE=WORK,VOICE:${cardData.phone}`,
      `EMAIL;TYPE=WORK:${cardData.email}`,
      cardData.website ? `URL:https://${cardData.website.replace(/^https?:\/\//, '')}` : '',
      cardData.address ? `ADR;TYPE=WORK:;;${cardData.address};;;;` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');
    return vCard;
  };

  const downloadVCard = () => {
    const vCard = generateVCard();
    const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.firstName}-${cardData.lastName}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // If no data provided, show empty state
  if (!cardData.firstName && !cardData.lastName) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            {lng === 'de' ? 'Visitenkarte nicht gefunden' : 'Business Card Not Found'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {lng === 'de'
              ? 'Diese Visitenkarte existiert nicht oder der Link ist ungueltig.'
              : 'This business card does not exist or the link is invalid.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {cardData.firstName} {cardData.lastName}
            </h1>
            {cardData.company && (
              <p className="text-zinc-600 dark:text-zinc-400">{cardData.company}</p>
            )}
          </div>

          {/* Flip Card Container */}
          <div
            className="perspective-1000 cursor-pointer mb-6"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="relative w-full aspect-[1.75/1]"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of Card */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
                style={{
                  backfaceVisibility: 'hidden',
                  backgroundColor: bgColor,
                }}
              >
                <div className="h-full p-6 flex flex-col justify-between">
                  <div className="flex items-start gap-4">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: accentColor }}
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                        style={{ backgroundColor: accentColor, color: bgColor }}
                      >
                        {cardData.firstName[0]}{cardData.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: textColor }}>
                        {cardData.firstName} {cardData.lastName}
                      </h3>
                      <p className="text-sm opacity-80" style={{ color: textColor }}>
                        {cardData.title}
                      </p>
                      <p className="text-sm font-medium" style={{ color: accentColor }}>
                        {cardData.company}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm" style={{ color: textColor }}>
                    {cardData.phone && <p className="opacity-90">{cardData.phone}</p>}
                    {cardData.email && <p className="opacity-90">{cardData.email}</p>}
                    {cardData.website && <p className="opacity-90">{cardData.website}</p>}
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundColor: bgColor,
                }}
              >
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG
                      value={generateVCard()}
                      size={120}
                      level="M"
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p className="mt-3 text-sm" style={{ color: textColor }}>
                    {lng === 'de' ? 'Scannen zum Speichern' : 'Scan to save contact'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Flip Button */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full py-2 flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-6"
          >
            <RotateCcw className="h-4 w-4" />
            {lng === 'de' ? 'Karte umdrehen' : 'Flip card'}
          </button>

          {/* Contact Actions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              {lng === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch'}
            </h2>

            <div className="grid gap-3">
              {cardData.phone && (
                <a
                  href={`tel:${cardData.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Phone className="h-5 w-5 text-blue-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">{cardData.phone}</span>
                </a>
              )}

              {cardData.email && (
                <a
                  href={`mailto:${cardData.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Mail className="h-5 w-5 text-green-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">{cardData.email}</span>
                </a>
              )}

              {cardData.website && (
                <a
                  href={`https://${cardData.website.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <Globe className="h-5 w-5 text-purple-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">{cardData.website}</span>
                </a>
              )}

              {cardData.address && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(cardData.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  <MapPin className="h-5 w-5 text-red-500" />
                  <span className="text-zinc-700 dark:text-zinc-300">{cardData.address}</span>
                </a>
              )}
            </div>

            {/* Save Contact Button */}
            <button
              onClick={downloadVCard}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              {lng === 'de' ? 'Kontakt speichern' : 'Save Contact'}
            </button>
          </div>

          {/* Powered by */}
          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {lng === 'de' ? 'Erstellt mit' : 'Created with'}{' '}
              <a
                href={`/${lng}/tools/qr-business-card`}
                className="text-blue-500 hover:underline"
              >
                PureTools
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </main>
  );
}
