'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi,
  Download,
  Copy,
  CheckCircle,
  Eye,
  EyeOff,
  Share2,
  Smartphone,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Language } from '@/i18n/settings';

interface WifiQrClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'WiFi QR Code Generator',
    subtitle: 'Generate a QR code for guests to easily connect to your WiFi network. Works offline.',
    networkName: 'Network Name (SSID)',
    networkNamePlaceholder: 'Enter your WiFi name',
    password: 'Password',
    passwordPlaceholder: 'Enter your WiFi password',
    showPassword: 'Show',
    hidePassword: 'Hide',
    encryption: 'Security Type',
    encryptionTypes: {
      WPA: 'WPA/WPA2/WPA3',
      WEP: 'WEP',
      nopass: 'No Password',
    },
    hidden: 'Hidden Network',
    hiddenHelp: 'Check if your network is not broadcasting its name',
    generate: 'Generate QR Code',
    downloadPng: 'Download PNG',
    downloadSvg: 'Download SVG',
    copied: 'Copied!',
    copy: 'Copy WiFi String',
    preview: 'Preview',
    scanToConnect: 'Scan to connect to WiFi',
    qrColor: 'QR Code Color',
    bgColor: 'Background Color',
    features: {
      title: 'Features',
      items: [
        { title: 'Instant Generation', desc: 'QR code generates as you type' },
        { title: '100% Offline', desc: 'Works without internet connection' },
        { title: 'Universal', desc: 'Compatible with iOS and Android' },
        { title: 'Customizable', desc: 'Choose your own colors' },
      ],
    },
    howItWorks: {
      title: 'How It Works',
      steps: [
        'Enter your WiFi network name and password',
        'Select the security type (usually WPA/WPA2)',
        'Download or share the QR code',
        'Guests scan with their phone camera to connect instantly',
      ],
    },
  },
  de: {
    title: 'WLAN QR-Code Generator',
    subtitle: 'Erstellen Sie einen QR-Code, damit Gäste sich einfach mit Ihrem WLAN verbinden können. Funktioniert offline.',
    networkName: 'Netzwerkname (SSID)',
    networkNamePlaceholder: 'Geben Sie Ihren WLAN-Namen ein',
    password: 'Passwort',
    passwordPlaceholder: 'Geben Sie Ihr WLAN-Passwort ein',
    showPassword: 'Anzeigen',
    hidePassword: 'Verbergen',
    encryption: 'Sicherheitstyp',
    encryptionTypes: {
      WPA: 'WPA/WPA2/WPA3',
      WEP: 'WEP',
      nopass: 'Kein Passwort',
    },
    hidden: 'Verstecktes Netzwerk',
    hiddenHelp: 'Aktivieren, wenn Ihr Netzwerk seinen Namen nicht sendet',
    generate: 'QR-Code generieren',
    downloadPng: 'PNG herunterladen',
    downloadSvg: 'SVG herunterladen',
    copied: 'Kopiert!',
    copy: 'WLAN-String kopieren',
    preview: 'Vorschau',
    scanToConnect: 'Scannen zum Verbinden',
    qrColor: 'QR-Code Farbe',
    bgColor: 'Hintergrundfarbe',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Sofortige Generierung', desc: 'QR-Code wird beim Tippen erstellt' },
        { title: '100% Offline', desc: 'Funktioniert ohne Internetverbindung' },
        { title: 'Universell', desc: 'Kompatibel mit iOS und Android' },
        { title: 'Anpassbar', desc: 'Wählen Sie Ihre eigenen Farben' },
      ],
    },
    howItWorks: {
      title: 'So funktioniert es',
      steps: [
        'Geben Sie Ihren WLAN-Namen und Passwort ein',
        'Wählen Sie den Sicherheitstyp (normalerweise WPA/WPA2)',
        'Laden Sie den QR-Code herunter oder teilen Sie ihn',
        'Gäste scannen mit ihrer Handykamera für sofortige Verbindung',
      ],
    },
  },
};

type EncryptionType = 'WPA' | 'WEP' | 'nopass';

export default function WifiQrClient({ lng }: WifiQrClientProps) {
  const t = content[lng];
  const qrRef = useRef<HTMLDivElement>(null);

  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<EncryptionType>('WPA');
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // Generate WiFi QR code string
  const generateWifiString = useCallback(() => {
    if (!ssid) return '';

    // Escape special characters
    const escapeString = (str: string) => {
      return str.replace(/\\/g, '\\\\')
                .replace(/;/g, '\\;')
                .replace(/,/g, '\\,')
                .replace(/:/g, '\\:')
                .replace(/"/g, '\\"');
    };

    const escapedSsid = escapeString(ssid);
    const escapedPassword = escapeString(password);

    let wifiString = `WIFI:T:${encryption};S:${escapedSsid};`;

    if (encryption !== 'nopass' && password) {
      wifiString += `P:${escapedPassword};`;
    }

    if (hidden) {
      wifiString += 'H:true;';
    }

    wifiString += ';';

    return wifiString;
  }, [ssid, password, encryption, hidden]);

  const wifiString = generateWifiString();

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    if (format === 'png') {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-${ssid || 'network'}.png`;
      a.click();
    } else {
      // Create SVG from canvas data
      const size = canvas.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, size, size);
      const moduleCount = Math.sqrt(imageData.data.length / 4);
      const moduleSize = size / moduleCount;

      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
      svgContent += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;

      for (let y = 0; y < moduleCount; y++) {
        for (let x = 0; x < moduleCount; x++) {
          const i = (y * moduleCount + x) * 4;
          if (imageData.data[i] < 128) {
            svgContent += `<rect x="${x * moduleSize}" y="${y * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${qrColor}"/>`;
          }
        }
      }

      svgContent += '</svg>';

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wifi-${ssid || 'network'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const copyWifiString = async () => {
    if (!wifiString) return;
    await navigator.clipboard.writeText(wifiString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-blue-100 dark:bg-blue-500/10 p-4">
            <Wifi className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
              {/* SSID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.networkName}
                </label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder={t.networkNamePlaceholder}
                  className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    disabled={encryption === 'nopass'}
                    className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-20 text-zinc-800 dark:text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPassword ? t.hidePassword : t.showPassword}
                  </button>
                </div>
              </div>

              {/* Encryption */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {t.encryption}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['WPA', 'WEP', 'nopass'] as EncryptionType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEncryption(type)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                        encryption === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {t.encryptionTypes[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hidden Network */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    className="h-5 w-5 rounded border-indigo-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.hidden}</span>
                    <p className="text-xs text-zinc-500">{t.hiddenHelp}</p>
                  </div>
                </label>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.qrColor}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-indigo-200 dark:border-zinc-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.bgColor}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-10 rounded-lg border border-indigo-200 dark:border-zinc-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
              <h3 className="mb-4 font-semibold text-zinc-800 dark:text-white flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-500" />
                {t.howItWorks.title}
              </h3>
              <ol className="space-y-2">
                {t.howItWorks.steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          {/* QR Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-24">
              <div className="rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
                <div className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.preview}</div>

                <div
                  ref={qrRef}
                  className="flex flex-col items-center justify-center rounded-xl p-8"
                  style={{ backgroundColor: bgColor }}
                >
                  {ssid ? (
                    <>
                      <QRCodeCanvas
                        value={wifiString}
                        size={256}
                        fgColor={qrColor}
                        bgColor={bgColor}
                        level="H"
                        includeMargin={false}
                      />
                      <p className="mt-4 text-sm font-medium" style={{ color: qrColor }}>
                        {t.scanToConnect}
                      </p>
                      <p className="text-lg font-bold" style={{ color: qrColor }}>
                        {ssid}
                      </p>
                    </>
                  ) : (
                    <div className="flex h-64 w-64 items-center justify-center">
                      <p className="text-center text-zinc-400">
                        {t.networkNamePlaceholder}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {ssid && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => downloadQR('png')}
                      className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-400"
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadPng}
                    </button>
                    <button
                      onClick={() => downloadQR('svg')}
                      className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-4 py-2 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600"
                    >
                      <Download className="h-4 w-4" />
                      {t.downloadSvg}
                    </button>
                    <button
                      onClick={copyWifiString}
                      className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-4 py-2 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {t.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          {t.copy}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <Wifi className="mb-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="mb-1 font-medium text-zinc-800 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
