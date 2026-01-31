'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, RotateCcw, User, Building, Phone, Mail, Globe, MapPin, Camera, Link2, Copy, Check, Share2, Loader2, RefreshCw } from 'lucide-react';
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

type QrMode = 'vcard' | 'link';

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
  const [qrMode, setQrMode] = useState<QrMode>('vcard');
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Generate shareable link by saving card to database
  const generateShareableLink = async () => {
    setIsGeneratingLink(true);
    setLinkError(null);

    try {
      const response = await fetch('/api/business-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cardData,
          bgColor,
          textColor,
          accentColor,
          photo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to create shareable link');
      }

      const baseUrl = window.location.origin;
      const link = `${baseUrl}/${lng}/tools/qr-business-card/view?id=${data.id}`;
      setShareableLink(link);
    } catch (error) {
      console.error('Error generating link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLinkError(lng === 'de' ? `Fehler: ${errorMessage}` : `Error: ${errorMessage}`);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Generate link when switching to link mode
  useEffect(() => {
    if (qrMode === 'link' && !shareableLink && !isGeneratingLink) {
      generateShareableLink();
    }
  }, [qrMode]);

  const copyShareableLink = async () => {
    if (!shareableLink) return;
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareableLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Reset shareable link when card data changes
  const handleCardChange = () => {
    if (shareableLink) {
      setShareableLink('');
    }
  };

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

    // Create an image to resize/compress
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const maxSize = 200; // Max width/height for profile photo
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw image on canvas (this handles WebP and other formats)
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to JPEG for smaller size and better compatibility
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setPhoto(compressedDataUrl);
          handleCardChange();
        }
      };

      img.onerror = () => {
        // If image fails to load (shouldn't happen often), try direct read
        setPhoto(event.target?.result as string);
        handleCardChange();
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Helper to convert any CSS color to RGB using canvas
  const convertColorToRgb = (color: string): string => {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return color;
    }
    // Already RGB/RGBA format
    if (color.startsWith('rgb')) {
      return color;
    }
    // Hex format is fine
    if (color.startsWith('#')) {
      return color;
    }
    // Convert modern CSS color functions (lab, oklch, etc.) using canvas
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 1;
      tempCanvas.height = 1;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
      }
    } catch {
      // Fallback to original color
    }
    return color;
  };

  // Process element and all children to convert colors to RGB
  const processColorsForExport = (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);

    // Color properties to convert
    const colorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'outlineColor',
    ];

    colorProps.forEach((prop) => {
      const value = computedStyle.getPropertyValue(prop.replace(/([A-Z])/g, '-$1').toLowerCase());
      if (value && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
        const converted = convertColorToRgb(value);
        element.style.setProperty(prop.replace(/([A-Z])/g, '-$1').toLowerCase(), converted);
      }
    });

    // Process children
    Array.from(element.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        processColorsForExport(child);
      }
    });
  };

  const exportCard = async (side: 'front' | 'back') => {
    const cardRef = side === 'front' ? frontCardRef : backCardRef;
    if (!cardRef.current) return;

    // Clone the element to avoid modifying the original
    const clone = cardRef.current.cloneNode(true) as HTMLElement;

    // Create a hidden container for the clone
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden;pointer-events:none;';

    // Set clone dimensions explicitly
    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.width = `${cardRef.current.offsetWidth}px`;
    clone.style.height = `${cardRef.current.offsetHeight}px`;

    container.appendChild(clone);
    document.body.appendChild(container);

    // Process colors to convert modern CSS color functions to RGB
    processColorsForExport(clone);

    // Use html2canvas dynamically imported
    const html2canvas = (await import('html2canvas')).default;

    try {
      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `business-card-${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      // Clean up container with clone
      document.body.removeChild(container);
    }
  };

  // Export complete card (front + back side by side)
  const exportCompleteCard = async () => {
    if (!frontCardRef.current || !backCardRef.current) return;

    const html2canvas = (await import('html2canvas')).default;

    // Create hidden containers for clones
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden;pointer-events:none;';

    // Clone and process front card
    const frontClone = frontCardRef.current.cloneNode(true) as HTMLElement;
    frontClone.style.position = 'relative';
    frontClone.style.left = '0';
    frontClone.style.top = '0';
    frontClone.style.width = `${frontCardRef.current.offsetWidth}px`;
    frontClone.style.height = `${frontCardRef.current.offsetHeight}px`;
    container.appendChild(frontClone);
    processColorsForExport(frontClone);

    // Clone and process back card
    const backClone = backCardRef.current.cloneNode(true) as HTMLElement;
    backClone.style.position = 'relative';
    backClone.style.left = '0';
    backClone.style.top = '0';
    backClone.style.width = `${backCardRef.current.offsetWidth}px`;
    backClone.style.height = `${backCardRef.current.offsetHeight}px`;
    backClone.style.transform = 'none'; // Remove flip transform
    backClone.style.backfaceVisibility = 'visible';
    container.appendChild(backClone);
    processColorsForExport(backClone);

    document.body.appendChild(container);

    try {
      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(frontClone, { backgroundColor: null, scale: 2, useCORS: true, width: frontCardRef.current.offsetWidth, height: frontCardRef.current.offsetHeight }),
        html2canvas(backClone, { backgroundColor: null, scale: 2, useCORS: true, width: backCardRef.current.offsetWidth, height: backCardRef.current.offsetHeight }),
      ]);

      // Create combined canvas
      const gap = 40;
      const combinedCanvas = document.createElement('canvas');
      combinedCanvas.width = frontCanvas.width + backCanvas.width + gap;
      combinedCanvas.height = Math.max(frontCanvas.height, backCanvas.height);

      const ctx = combinedCanvas.getContext('2d');
      if (ctx) {
        // Transparent background
        ctx.clearRect(0, 0, combinedCanvas.width, combinedCanvas.height);
        // Draw front card
        ctx.drawImage(frontCanvas, 0, 0);
        // Draw back card
        ctx.drawImage(backCanvas, frontCanvas.width + gap, 0);

        const link = document.createElement('a');
        link.download = 'business-card-complete.png';
        link.href = combinedCanvas.toDataURL('image/png');
        link.click();
      }
    } finally {
      document.body.removeChild(container);
    }
  };

  const updateCardData = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
    handleCardChange();
  };

  const updateBgColor = (color: string) => {
    setBgColor(color);
    handleCardChange();
  };

  const updateTextColor = (color: string) => {
    setTextColor(color);
    handleCardChange();
  };

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    handleCardChange();
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
                        onClick={() => { setPhoto(null); handleCardChange(); }}
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
                        onChange={(e) => updateBgColor(e.target.value)}
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
                        onChange={(e) => updateTextColor(e.target.value)}
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
                        onChange={(e) => updateAccentColor(e.target.value)}
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
                      <div className="bg-white p-3 rounded-xl min-w-[144px] min-h-[144px] flex items-center justify-center">
                        {qrMode === 'link' && isGeneratingLink ? (
                          <Loader2 className="h-12 w-12 text-zinc-400 animate-spin" />
                        ) : qrMode === 'link' && linkError ? (
                          <div className="text-red-500 text-sm text-center p-2">{linkError}</div>
                        ) : qrMode === 'link' && !shareableLink ? (
                          <Loader2 className="h-12 w-12 text-zinc-400 animate-spin" />
                        ) : (
                          <QRCodeSVG
                            value={qrMode === 'vcard' ? generateVCard() : shareableLink}
                            size={120}
                            level="M"
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        )}
                      </div>
                      <p className="mt-3 text-sm" style={{ color: textColor }}>
                        {qrMode === 'vcard'
                          ? (lng === 'de' ? 'Scannen zum Speichern' : 'Scan to save contact')
                          : (lng === 'de' ? 'Scannen für interaktive Karte' : 'Scan for interactive card')}
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

              {/* QR Mode Toggle */}
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 flex">
                <button
                  onClick={() => setQrMode('vcard')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    qrMode === 'vcard'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  vCard
                </button>
                <button
                  onClick={() => setQrMode('link')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    qrMode === 'link'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                  {lng === 'de' ? 'Teilbarer Link' : 'Shareable Link'}
                </button>
              </div>

              {/* Copy Link (only shown in link mode) */}
              {qrMode === 'link' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={isGeneratingLink ? (lng === 'de' ? 'Link wird erstellt...' : 'Creating link...') : (shareableLink || (lng === 'de' ? 'Link generieren...' : 'Generating link...'))}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm truncate"
                    />
                    <button
                      onClick={generateShareableLink}
                      disabled={isGeneratingLink}
                      className="px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all disabled:opacity-50"
                      title={lng === 'de' ? 'Link aktualisieren' : 'Refresh link'}
                    >
                      {isGeneratingLink ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={copyShareableLink}
                      disabled={!shareableLink || isGeneratingLink}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 ${
                        linkCopied
                          ? 'bg-green-500 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      }`}
                    >
                      {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {linkError && (
                    <p className="text-red-500 text-sm">{linkError}</p>
                  )}
                </div>
              )}

              {/* Export Buttons */}
              <div className="space-y-3">
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
                <button
                  onClick={exportCompleteCard}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  {lng === 'de' ? 'Komplette Karte herunterladen' : 'Download Complete Card'}
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                {qrMode === 'vcard'
                  ? (lng === 'de'
                    ? 'Der QR-Code enthält eine vCard mit Ihren Kontaktdaten. Beim Scannen können die Daten direkt in das Adressbuch gespeichert werden.'
                    : 'The QR code contains a vCard with your contact details. When scanned, the data can be saved directly to the address book.')
                  : (lng === 'de'
                    ? 'Der QR-Code führt zu einer interaktiven Seite mit Ihrer Visitenkarte inkl. Profilbild. Der Link ist 1 Jahr gültig.'
                    : 'The QR code leads to an interactive page with your business card including profile photo. The link is valid for 1 year.')
                }
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
