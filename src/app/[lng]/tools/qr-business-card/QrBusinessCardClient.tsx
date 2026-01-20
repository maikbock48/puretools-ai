'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, RotateCcw, User, Building, Phone, Mail, Globe, MapPin, Camera } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface QrBusinessCardClientProps {
  lng: Language;
}

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

export default function QrBusinessCardClient({ lng }: QrBusinessCardClientProps) {
  const { t } = useTranslation(lng);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    firstName: 'Max',
    lastName: 'Mustermann',
    title: lng === 'de' ? 'Geschäftsführer' : 'CEO',
    company: 'Musterfirma GmbH',
    phone: '+49 123 456 7890',
    email: 'max@musterfirma.de',
    website: 'www.musterfirma.de',
    address: lng === 'de' ? 'Musterstraße 1, 12345 Berlin' : '123 Example St, Berlin',
  });
  const [bgColor, setBgColor] = useState('#1e3a5f');
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#60a5fa');
  const [photo, setPhoto] = useState<string | null>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const exportCard = async (side: 'front' | 'back') => {
    const cardRef = side === 'front' ? frontCardRef : backCardRef;
    if (!cardRef.current) return;

    // Use html2canvas dynamically imported
    const html2canvas = (await import('html2canvas')).default;

    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `business-card-${side}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const updateCardData = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white mb-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {lng === 'de' ? 'QR Visitenkarte' : 'QR Business Card'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {lng === 'de'
                ? 'Erstellen Sie eine digitale Visitenkarte mit QR-Code'
                : 'Create a digital business card with QR code'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
                {lng === 'de' ? 'Kontaktdaten' : 'Contact Details'}
              </h2>

              <div className="space-y-4">
                {/* Photo Upload */}
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-600"
                  >
                    {photo ? (
                      <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {lng === 'de' ? 'Foto hinzufügen' : 'Add photo'}
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {photo && (
                      <button
                        onClick={() => setPhoto(null)}
                        className="block text-sm text-red-500 hover:underline mt-1"
                      >
                        {lng === 'de' ? 'Entfernen' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {lng === 'de' ? 'Vorname' : 'First Name'}
                    </label>
                    <input
                      type="text"
                      value={cardData.firstName}
                      onChange={(e) => updateCardData('firstName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 block">
                      {lng === 'de' ? 'Nachname' : 'Last Name'}
                    </label>
                    <input
                      type="text"
                      value={cardData.lastName}
                      onChange={(e) => updateCardData('lastName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Title & Company */}
                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 block">
                    {lng === 'de' ? 'Position' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    value={cardData.title}
                    onChange={(e) => updateCardData('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {lng === 'de' ? 'Firma' : 'Company'}
                  </label>
                  <input
                    type="text"
                    value={cardData.company}
                    onChange={(e) => updateCardData('company', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                {/* Contact Info */}
                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lng === 'de' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={cardData.phone}
                    onChange={(e) => updateCardData('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {lng === 'de' ? 'E-Mail' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={cardData.email}
                    onChange={(e) => updateCardData('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </label>
                  <input
                    type="text"
                    value={cardData.website}
                    onChange={(e) => updateCardData('website', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {lng === 'de' ? 'Adresse' : 'Address'}
                  </label>
                  <input
                    type="text"
                    value={cardData.address}
                    onChange={(e) => updateCardData('address', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                  />
                </div>

                {/* Colors */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <h3 className="font-medium text-zinc-900 dark:text-white mb-3">
                    {lng === 'de' ? 'Farben' : 'Colors'}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {lng === 'de' ? 'Hintergrund' : 'Background'}
                      </label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {lng === 'de' ? 'Text' : 'Text'}
                      </label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {lng === 'de' ? 'Akzent' : 'Accent'}
                      </label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full h-10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Preview */}
            <div className="space-y-6">
              {/* Flip Card Container */}
              <div
                className="perspective-1000 cursor-pointer"
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
                    ref={frontCardRef}
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
                    ref={backCardRef}
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
                className="w-full py-2 flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                {lng === 'de' ? 'Karte umdrehen' : 'Flip card'}
              </button>

              {/* Export Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => exportCard('front')}
                  className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {lng === 'de' ? 'Vorderseite' : 'Front Side'}
                </button>
                <button
                  onClick={() => exportCard('back')}
                  className="py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {lng === 'de' ? 'Rückseite' : 'Back Side'}
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                {lng === 'de'
                  ? 'Der QR-Code enthält eine vCard mit Ihren Kontaktdaten. Beim Scannen können die Daten direkt in das Adressbuch gespeichert werden.'
                  : 'The QR code contains a vCard with your contact details. When scanned, the data can be saved directly to the address book.'}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('common.privacyNote')}
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
