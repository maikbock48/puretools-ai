'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crop, Upload, Download, RotateCcw, Move } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface SocialCropperClientProps {
  lng: Language;
}

interface CropPreset {
  name: string;
  nameDE: string;
  width: number;
  height: number;
  category: string;
}

const PRESETS: CropPreset[] = [
  // Instagram
  { name: 'Instagram Post', nameDE: 'Instagram Beitrag', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'Instagram Portrait', nameDE: 'Instagram Hochformat', width: 1080, height: 1350, category: 'Instagram' },
  { name: 'Instagram Story', nameDE: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram' },
  // Facebook
  { name: 'Facebook Post', nameDE: 'Facebook Beitrag', width: 1200, height: 630, category: 'Facebook' },
  { name: 'Facebook Cover', nameDE: 'Facebook Titelbild', width: 820, height: 312, category: 'Facebook' },
  { name: 'Facebook Profile', nameDE: 'Facebook Profil', width: 180, height: 180, category: 'Facebook' },
  // Twitter/X
  { name: 'Twitter Post', nameDE: 'Twitter Beitrag', width: 1200, height: 675, category: 'Twitter/X' },
  { name: 'Twitter Header', nameDE: 'Twitter Header', width: 1500, height: 500, category: 'Twitter/X' },
  // YouTube
  { name: 'YouTube Thumbnail', nameDE: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube' },
  { name: 'YouTube Banner', nameDE: 'YouTube Banner', width: 2560, height: 1440, category: 'YouTube' },
  // LinkedIn
  { name: 'LinkedIn Post', nameDE: 'LinkedIn Beitrag', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'LinkedIn Cover', nameDE: 'LinkedIn Titelbild', width: 1584, height: 396, category: 'LinkedIn' },
  // Pinterest
  { name: 'Pinterest Pin', nameDE: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest' },
  // TikTok
  { name: 'TikTok Video', nameDE: 'TikTok Video', width: 1080, height: 1920, category: 'TikTok' },
];

const CATEGORIES = ['Instagram', 'Facebook', 'Twitter/X', 'YouTube', 'LinkedIn', 'Pinterest', 'TikTok'];

export default function SocialCropperClient({ lng }: SocialCropperClientProps) {
  const { t } = useTranslation(lng);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<CropPreset>(PRESETS[0]);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      setImageUrl(url);
      setCropPosition({ x: 0, y: 0 });

      // Calculate initial scale to fit
      const aspectRatio = selectedPreset.width / selectedPreset.height;
      const imgAspect = img.width / img.height;

      if (imgAspect > aspectRatio) {
        setScale(selectedPreset.height / img.height);
      } else {
        setScale(selectedPreset.width / img.width);
      }
    };
    img.src = url;
  }, [selectedPreset]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handlePresetChange = (preset: CropPreset) => {
    setSelectedPreset(preset);
    if (image) {
      const aspectRatio = preset.width / preset.height;
      const imgAspect = image.width / image.height;

      if (imgAspect > aspectRatio) {
        setScale(preset.height / image.height);
      } else {
        setScale(preset.width / image.width);
      }
      setCropPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Calculate bounds
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const previewWidth = 400;
    const previewHeight = (400 * selectedPreset.height) / selectedPreset.width;

    const minX = Math.min(0, previewWidth - scaledWidth);
    const minY = Math.min(0, previewHeight - scaledHeight);

    setCropPosition({
      x: Math.max(minX, Math.min(0, newX)),
      y: Math.max(minY, Math.min(0, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleScaleChange = (newScale: number) => {
    if (!image) return;

    // Ensure minimum scale to cover the crop area
    const aspectRatio = selectedPreset.width / selectedPreset.height;
    const imgAspect = image.width / image.height;
    const minScale = imgAspect > aspectRatio
      ? selectedPreset.height / image.height
      : selectedPreset.width / image.width;

    const clampedScale = Math.max(minScale, Math.min(3, newScale));
    setScale(clampedScale);

    // Reset position if image becomes smaller than crop area
    const scaledWidth = image.width * clampedScale;
    const scaledHeight = image.height * clampedScale;
    const previewWidth = 400;
    const previewHeight = (400 * selectedPreset.height) / selectedPreset.width;

    setCropPosition({
      x: Math.max(previewWidth - scaledWidth, Math.min(0, cropPosition.x)),
      y: Math.max(previewHeight - scaledHeight, Math.min(0, cropPosition.y)),
    });
  };

  const handleExport = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = selectedPreset.width;
    canvas.height = selectedPreset.height;

    // Calculate the source coordinates based on preview position
    const previewWidth = 400;
    const previewHeight = (400 * selectedPreset.height) / selectedPreset.width;

    const sourceX = (-cropPosition.x / previewWidth) * selectedPreset.width / scale;
    const sourceY = (-cropPosition.y / previewHeight) * selectedPreset.height / scale;
    const sourceWidth = selectedPreset.width / scale;
    const sourceHeight = selectedPreset.height / scale;

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      selectedPreset.width,
      selectedPreset.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const resetCrop = () => {
    if (!image) return;
    setCropPosition({ x: 0, y: 0 });
    const aspectRatio = selectedPreset.width / selectedPreset.height;
    const imgAspect = image.width / image.height;

    if (imgAspect > aspectRatio) {
      setScale(selectedPreset.height / image.height);
    } else {
      setScale(selectedPreset.width / image.width);
    }
  };

  const previewHeight = (400 * selectedPreset.height) / selectedPreset.width;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white mb-4">
              <Crop className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {lng === 'de' ? 'Social Media Cropper' : 'Social Media Cropper'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {lng === 'de'
                ? 'Bilder perfekt für Social Media zuschneiden'
                : 'Crop images perfectly for social media platforms'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Presets Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
                {lng === 'de' ? 'Format wählen' : 'Select Format'}
              </h2>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {CATEGORIES.map((category) => (
                  <div key={category}>
                    <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {PRESETS.filter((p) => p.category === category).map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handlePresetChange(preset)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                            selectedPreset.name === preset.name
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700'
                              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <div className="font-medium">
                            {lng === 'de' ? preset.nameDE : preset.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {preset.width} × {preset.height}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview & Controls */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                {/* Upload or Preview Area */}
                {!image ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 text-center cursor-pointer transition-colors hover:border-pink-400 dark:hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/20"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                      {lng === 'de'
                        ? 'Bild hierher ziehen oder klicken'
                        : 'Drag & drop image here or click'}
                    </p>
                    <p className="text-sm text-zinc-500">
                      JPG, PNG, WebP
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Crop Preview */}
                    <div className="flex justify-center">
                      <div
                        ref={previewRef}
                        className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-move select-none"
                        style={{
                          width: 400,
                          height: previewHeight,
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="absolute pointer-events-none"
                            style={{
                              transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${scale})`,
                              transformOrigin: 'top left',
                              maxWidth: 'none',
                            }}
                            draggable={false}
                          />
                        )}
                        {/* Overlay hint */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <Move className="h-4 w-4" />
                            {lng === 'de' ? 'Ziehen zum Verschieben' : 'Drag to reposition'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scale Control */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {lng === 'de' ? 'Zoom' : 'Zoom'}
                      </span>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.01"
                        value={scale}
                        onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                        className="flex-1 accent-pink-500"
                      />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 w-16 text-right">
                        {Math.round(scale * 100)}%
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={resetCrop}
                        className="flex-1 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-5 w-5" />
                        {lng === 'de' ? 'Zurücksetzen' : 'Reset'}
                      </button>
                      <button
                        onClick={handleExport}
                        className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="h-5 w-5" />
                        {lng === 'de' ? 'Herunterladen' : 'Download'}
                      </button>
                    </div>

                    {/* Change Image */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {lng === 'de' ? 'Anderes Bild wählen' : 'Choose different image'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Selected Format Info */}
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-pink-700 dark:text-pink-300">
                    {lng === 'de' ? selectedPreset.nameDE : selectedPreset.name}
                  </div>
                  <div className="text-sm text-pink-600 dark:text-pink-400">
                    {selectedPreset.width} × {selectedPreset.height} px
                  </div>
                </div>
                <div className="text-pink-600 dark:text-pink-400">
                  {(selectedPreset.width / selectedPreset.height).toFixed(2)}:1
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Canvas for Export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('common.privacyNote')}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
