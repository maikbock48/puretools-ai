'use client';

import { useState, useRef, useCallback } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Download,
  Upload,
  Trash2,
  Shield,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';
import SocialShare from '@/components/SocialShare';
import { useShareModal } from '@/components/ShareModal';

interface QRGeneratorClientProps {
  lng: Language;
}

export default function QRGeneratorClient({ lng }: QRGeneratorClientProps) {
  const { t } = useTranslation(lng);
  const [value, setValue] = useState('https://puretools.ai');
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#18181b');
  const [logo, setLogo] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Share modal hook
  const { openShareModal, ShareModalComponent } = useShareModal(
    t('tools.qrGenerator.title'),
    `/${lng}/tools/qr-generator`,
    lng
  );

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeLogo = useCallback(() => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = url;
      link.click();
      // Show share modal after download
      setTimeout(() => openShareModal(value ? `QR for: ${value.substring(0, 30)}...` : undefined), 500);
    }
  }, [value, openShareModal]);

  const downloadSVG = useCallback(() => {
    const svg = canvasRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      // Show share modal after download
      setTimeout(() => openShareModal(value ? `QR for: ${value.substring(0, 30)}...` : undefined), 500);
    }
  }, [value, openShareModal]);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex rounded-xl bg-emerald-100 dark:bg-emerald-500/10 p-3">
            <QrCode className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">
            {t('tools.qrGenerator.title')}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">{t('tools.qrGenerator.description')}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Shield className="h-4 w-4" />
              {t('common.privacyNote')}
            </div>
            <SocialShare
              url={typeof window !== 'undefined' ? window.location.href : `https://puretools.ai/${lng}/tools/qr-generator`}
              title={t('tools.qrGenerator.title')}
              description={t('tools.qrGenerator.description')}
            />
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* URL/Text Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('qr.inputLabel')}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t('qr.inputPlaceholder')}
                className="w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-500 dark:focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Palette className="h-4 w-4" />
                  {t('qr.colorLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-white focus:border-indigo-500 dark:focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Palette className="h-4 w-4" />
                  {t('qr.bgColorLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-white focus:border-indigo-500 dark:focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <ImageIcon className="h-4 w-4" />
                {t('qr.logoLabel')}
              </label>
              {logo ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                    <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('qr.logoRemove')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 py-8 text-sm font-medium text-indigo-600 dark:text-zinc-400 transition-colors hover:border-indigo-400 dark:hover:border-emerald-500/50 hover:text-indigo-700 dark:hover:text-emerald-400"
                >
                  <Upload className="h-5 w-5" />
                  {t('qr.logoUpload')}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Download Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadPNG}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400"
              >
                <Download className="h-5 w-5" />
                {t('qr.downloadPng')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadSVG}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-3 font-semibold text-zinc-800 dark:text-white transition-colors hover:bg-indigo-50 dark:hover:bg-zinc-800"
              >
                <Download className="h-5 w-5" />
                {t('qr.downloadSvg')}
              </motion.button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="mb-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('qr.preview')}</div>
            <div
              ref={canvasRef}
              className="flex items-center justify-center rounded-2xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8"
              style={{ backgroundColor: bgColor }}
            >
              {/* Visible SVG for preview */}
              <QRCodeSVG
                value={value || ' '}
                size={256}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={false}
                imageSettings={
                  logo
                    ? {
                        src: logo,
                        height: 50,
                        width: 50,
                        excavate: true,
                      }
                    : undefined
                }
              />
              {/* Hidden canvas for PNG download */}
              <div className="hidden">
                <QRCodeCanvas
                  value={value || ' '}
                  size={512}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level="H"
                  includeMargin={false}
                  imageSettings={
                    logo
                      ? {
                          src: logo,
                          height: 100,
                          width: 100,
                          excavate: true,
                        }
                      : undefined
                  }
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModalComponent />
    </div>
  );
}
