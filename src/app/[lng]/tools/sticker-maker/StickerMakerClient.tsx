'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sticker, Upload, Download, Loader2, Palette, Maximize2, Sparkles, Square, Circle, Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface StickerMakerClientProps {
  lng: Language;
}

type BorderStyle = 'solid' | 'gradient' | 'glow';
type SizePreset = 'custom' | 'whatsapp' | 'telegram' | 'instagram' | 'discord';

const SIZE_PRESETS: Record<SizePreset, { width: number; height: number; label: string }> = {
  custom: { width: 0, height: 0, label: 'Custom' },
  whatsapp: { width: 512, height: 512, label: 'WhatsApp (512x512)' },
  telegram: { width: 512, height: 512, label: 'Telegram (512x512)' },
  instagram: { width: 640, height: 640, label: 'Instagram (640x640)' },
  discord: { width: 320, height: 320, label: 'Discord (320x320)' },
};

const GRADIENT_PRESETS = [
  { name: 'Sunset', colors: ['#f97316', '#ec4899'] },
  { name: 'Ocean', colors: ['#06b6d4', '#3b82f6'] },
  { name: 'Forest', colors: ['#22c55e', '#14b8a6'] },
  { name: 'Purple', colors: ['#a855f7', '#6366f1'] },
  { name: 'Fire', colors: ['#ef4444', '#f97316'] },
  { name: 'Rainbow', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'] },
];

export default function StickerMakerClient({ lng }: StickerMakerClientProps) {
  const { t } = useTranslation(lng);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Border settings
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('solid');
  const [selectedGradient, setSelectedGradient] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(20);

  // Shadow settings
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(5);
  const [shadowOffsetY, setShadowOffsetY] = useState(5);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowOpacity, setShadowOpacity] = useState(0.3);

  // Size settings
  const [sizePreset, setSizePreset] = useState<SizePreset>('custom');
  const [padding, setPadding] = useState(20);

  // Shape settings
  const [cornerRadius, setCornerRadius] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError(lng === 'de' ? 'Bitte ein Bild auswählen' : 'Please select an image');
      return;
    }

    setError(null);
    setProcessedUrl(null);

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setOriginalImage(img);
      setOriginalUrl(url);
    };
    img.src = url;
  }, [lng]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const processImage = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Step 1: Remove background using @imgly/background-removal
      setProgress(20);
      const { removeBackground } = await import('@imgly/background-removal');

      // Convert image to blob
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalImage.width;
      tempCanvas.height = originalImage.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Could not get canvas context');
      tempCtx.drawImage(originalImage, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        tempCanvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      setProgress(40);

      // Remove background
      const resultBlob = await removeBackground(blob, {
        progress: (key, current, total) => {
          const bgProgress = 40 + (current / total) * 30;
          setProgress(Math.round(bgProgress));
        },
      });

      setProgress(70);

      // Load the result as an image
      const resultUrl = URL.createObjectURL(resultBlob);
      const resultImg = new window.Image();
      await new Promise<void>((resolve, reject) => {
        resultImg.onload = () => resolve();
        resultImg.onerror = reject;
        resultImg.src = resultUrl;
      });

      setProgress(80);

      // Step 2: Calculate final size
      const canvas = canvasRef.current;
      let finalWidth: number, finalHeight: number;

      if (sizePreset !== 'custom') {
        const preset = SIZE_PRESETS[sizePreset];
        finalWidth = preset.width;
        finalHeight = preset.height;
      } else {
        const totalPadding = borderWidth * 2 + padding * 2 + (shadowEnabled ? shadowBlur + Math.abs(shadowOffsetX) : 0);
        finalWidth = resultImg.width + totalPadding * 2;
        finalHeight = resultImg.height + totalPadding * 2;
      }

      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate image size and position
      let imgWidth = resultImg.width;
      let imgHeight = resultImg.height;
      const maxImageSize = Math.min(
        finalWidth - (borderWidth * 2 + padding * 2) - (shadowEnabled ? shadowBlur + Math.abs(shadowOffsetX) : 0),
        finalHeight - (borderWidth * 2 + padding * 2) - (shadowEnabled ? shadowBlur + Math.abs(shadowOffsetY) : 0)
      );

      if (imgWidth > maxImageSize || imgHeight > maxImageSize) {
        const scale = maxImageSize / Math.max(imgWidth, imgHeight);
        imgWidth *= scale;
        imgHeight *= scale;
      }

      const imgX = (finalWidth - imgWidth) / 2;
      const imgY = (finalHeight - imgHeight) / 2;

      setProgress(85);

      // Create outline/border canvas
      const outlineCanvas = document.createElement('canvas');
      outlineCanvas.width = finalWidth;
      outlineCanvas.height = finalHeight;
      const outlineCtx = outlineCanvas.getContext('2d');
      if (!outlineCtx) throw new Error('Could not get outline canvas context');

      // Draw the image to get its silhouette
      outlineCtx.drawImage(resultImg, imgX, imgY, imgWidth, imgHeight);

      // Get image data and create silhouette
      const imageData = outlineCtx.getImageData(0, 0, outlineCanvas.width, outlineCanvas.height);
      const data = imageData.data;

      // Prepare border color(s)
      let borderColors: string[];
      if (borderStyle === 'gradient') {
        borderColors = GRADIENT_PRESETS[selectedGradient].colors;
      } else {
        borderColors = [borderColor];
      }

      // Convert primary border color to RGB for silhouette
      const hexColor = borderColors[0].replace('#', '');
      const r = parseInt(hexColor.slice(0, 2), 16);
      const g = parseInt(hexColor.slice(2, 4), 16);
      const b = parseInt(hexColor.slice(4, 6), 16);

      // Make all non-transparent pixels the border color
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
      outlineCtx.putImageData(imageData, 0, 0);

      setProgress(90);

      // Apply shadow if enabled
      if (shadowEnabled) {
        ctx.shadowColor = shadowColor + Math.round(shadowOpacity * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
      }

      // Draw the border based on style
      if (borderStyle === 'glow') {
        // Glow effect - multiple layers with decreasing opacity
        for (let i = glowIntensity; i > 0; i -= 2) {
          ctx.globalAlpha = (glowIntensity - i) / glowIntensity * 0.8;
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
            const offsetX = Math.cos(angle) * (borderWidth + i);
            const offsetY = Math.sin(angle) * (borderWidth + i);
            ctx.drawImage(outlineCanvas, offsetX, offsetY);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Draw solid/gradient border
      if (borderStyle === 'gradient') {
        // Create gradient border by drawing in multiple directions
        const gradient = ctx.createLinearGradient(0, 0, finalWidth, finalHeight);
        borderColors.forEach((color, index) => {
          gradient.addColorStop(index / (borderColors.length - 1), color);
        });

        // Draw the outline
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
          for (let distance = 1; distance <= borderWidth; distance++) {
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            ctx.drawImage(outlineCanvas, offsetX, offsetY);
          }
        }
      } else {
        // Solid border
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
          for (let distance = 1; distance <= borderWidth; distance++) {
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            ctx.drawImage(outlineCanvas, offsetX, offsetY);
          }
        }
      }

      // Reset shadow for main image
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Draw the original image on top
      ctx.drawImage(resultImg, imgX, imgY, imgWidth, imgHeight);

      // Apply corner radius if set
      if (cornerRadius > 0) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        const cr = cornerRadius;
        ctx.moveTo(cr, 0);
        ctx.lineTo(finalWidth - cr, 0);
        ctx.quadraticCurveTo(finalWidth, 0, finalWidth, cr);
        ctx.lineTo(finalWidth, finalHeight - cr);
        ctx.quadraticCurveTo(finalWidth, finalHeight, finalWidth - cr, finalHeight);
        ctx.lineTo(cr, finalHeight);
        ctx.quadraticCurveTo(0, finalHeight, 0, finalHeight - cr);
        ctx.lineTo(0, cr);
        ctx.quadraticCurveTo(0, 0, cr, 0);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      setProgress(100);

      // Create final result
      const finalUrl = canvas.toDataURL('image/png');
      setProcessedUrl(finalUrl);

      // Cleanup
      URL.revokeObjectURL(resultUrl);
    } catch (err) {
      console.error('Processing error:', err);
      setError(lng === 'de'
        ? 'Fehler bei der Verarbeitung. Bitte versuchen Sie es erneut.'
        : 'Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = 'sticker.png';
    link.click();
  };

  const clearImage = () => {
    setOriginalImage(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white mb-4">
              <Sticker className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {lng === 'de' ? 'Sticker Generator' : 'Sticker Maker'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {lng === 'de'
                ? 'Erstellen Sie professionelle Sticker mit Umrandung, Schatten und mehr'
                : 'Create professional stickers with borders, shadows and more'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Upload Area */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {lng === 'de' ? 'Bild hochladen' : 'Upload Image'}
                </h2>

                {!originalImage ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/20"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
                    <p className="text-zinc-600 dark:text-zinc-400 mb-1">
                      {lng === 'de' ? 'Bild hierher ziehen oder klicken' : 'Drag & drop image or click'}
                    </p>
                    <p className="text-sm text-zinc-500">JPG, PNG, WebP</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                      {originalUrl && (
                        <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
                      )}
                    </div>

                    {/* Progress */}
                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {lng === 'de' ? 'Verarbeite...' : 'Processing...'}
                          </span>
                          <span className="text-orange-600 dark:text-orange-400">{progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={clearImage}
                        className="flex-1 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                      >
                        {lng === 'de' ? 'Neues Bild' : 'New Image'}
                      </button>
                      <button
                        onClick={processImage}
                        disabled={isProcessing}
                        className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-medium rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {lng === 'de' ? 'Verarbeite...' : 'Processing...'}
                          </>
                        ) : (
                          <>
                            <Sticker className="h-5 w-5" />
                            {lng === 'de' ? 'Sticker erstellen' : 'Create Sticker'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Border Settings */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  {lng === 'de' ? 'Rand-Einstellungen' : 'Border Settings'}
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Border Style */}
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                      {lng === 'de' ? 'Stil' : 'Style'}
                    </label>
                    <div className="flex gap-2">
                      {(['solid', 'gradient', 'glow'] as BorderStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setBorderStyle(style)}
                          className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${
                            borderStyle === style
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {style === 'solid' && (lng === 'de' ? 'Solide' : 'Solid')}
                          {style === 'gradient' && 'Gradient'}
                          {style === 'glow' && (lng === 'de' ? 'Leuchten' : 'Glow')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Width */}
                  <div>
                    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      <Maximize2 className="h-4 w-4" />
                      {lng === 'de' ? 'Randbreite' : 'Border Width'}: {borderWidth}px
                    </label>
                    <input
                      type="range"
                      value={borderWidth}
                      onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                      min="3"
                      max="40"
                      className="w-full accent-orange-500"
                    />
                  </div>
                </div>

                {/* Border Color / Gradient Selection */}
                {borderStyle === 'solid' && (
                  <div className="mt-4">
                    <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                      {lng === 'de' ? 'Randfarbe' : 'Border Color'}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setBorderColor(color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            borderColor === color ? 'border-orange-500 scale-110' : 'border-zinc-300 dark:border-zinc-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {borderStyle === 'gradient' && (
                  <div className="mt-4">
                    <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                      {lng === 'de' ? 'Gradient wählen' : 'Select Gradient'}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {GRADIENT_PRESETS.map((preset, index) => (
                        <button
                          key={preset.name}
                          onClick={() => setSelectedGradient(index)}
                          className={`h-8 w-16 rounded-lg border-2 transition-all ${
                            selectedGradient === index ? 'border-orange-500 scale-110' : 'border-zinc-300 dark:border-zinc-600'
                          }`}
                          style={{
                            background: `linear-gradient(to right, ${preset.colors.join(', ')})`,
                          }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {borderStyle === 'glow' && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      <Sparkles className="h-4 w-4" />
                      {lng === 'de' ? 'Leucht-Intensität' : 'Glow Intensity'}: {glowIntensity}px
                    </label>
                    <input
                      type="range"
                      value={glowIntensity}
                      onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                      min="5"
                      max="50"
                      className="w-full accent-orange-500"
                    />
                    <div className="mt-3">
                      <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                        {lng === 'de' ? 'Leuchtfarbe' : 'Glow Color'}
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {['#ffffff', '#ffff00', '#00ffff', '#ff00ff', '#00ff00'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBorderColor(color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              borderColor === color ? 'border-orange-500 scale-110' : 'border-zinc-300 dark:border-zinc-600'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shadow & Size Settings */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Shadow Settings */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      {lng === 'de' ? 'Schatten' : 'Shadow'}
                    </h2>
                    <button
                      onClick={() => setShadowEnabled(!shadowEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        shadowEnabled ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          shadowEnabled ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {shadowEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">
                          {lng === 'de' ? 'Unschärfe' : 'Blur'}: {shadowBlur}px
                        </label>
                        <input
                          type="range"
                          value={shadowBlur}
                          onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                          min="0"
                          max="30"
                          className="w-full accent-orange-500 h-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">X: {shadowOffsetX}px</label>
                          <input
                            type="range"
                            value={shadowOffsetX}
                            onChange={(e) => setShadowOffsetX(parseInt(e.target.value))}
                            min="-20"
                            max="20"
                            className="w-full accent-orange-500 h-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Y: {shadowOffsetY}px</label>
                          <input
                            type="range"
                            value={shadowOffsetY}
                            onChange={(e) => setShadowOffsetY(parseInt(e.target.value))}
                            min="-20"
                            max="20"
                            className="w-full accent-orange-500 h-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">
                          {lng === 'de' ? 'Deckkraft' : 'Opacity'}: {Math.round(shadowOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          value={shadowOpacity}
                          onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                          min="0"
                          max="1"
                          step="0.1"
                          className="w-full accent-orange-500 h-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Size & Shape Settings */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                  <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <Square className="h-5 w-5" />
                    {lng === 'de' ? 'Größe & Form' : 'Size & Shape'}
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {lng === 'de' ? 'Größen-Vorlage' : 'Size Preset'}
                      </label>
                      <select
                        value={sizePreset}
                        onChange={(e) => setSizePreset(e.target.value as SizePreset)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white"
                      >
                        {Object.entries(SIZE_PRESETS).map(([key, { label }]) => (
                          <option key={key} value={key}>
                            {key === 'custom' ? (lng === 'de' ? 'Automatisch' : 'Auto') : label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {lng === 'de' ? 'Innenabstand' : 'Padding'}: {padding}px
                      </label>
                      <input
                        type="range"
                        value={padding}
                        onChange={(e) => setPadding(parseInt(e.target.value))}
                        min="0"
                        max="50"
                        className="w-full accent-orange-500 h-1"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                        <Circle className="h-3 w-3" />
                        {lng === 'de' ? 'Ecken-Radius' : 'Corner Radius'}: {cornerRadius}px
                      </label>
                      <input
                        type="range"
                        value={cornerRadius}
                        onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full accent-orange-500 h-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
                {lng === 'de' ? 'Ergebnis' : 'Result'}
              </h2>

              {processedUrl ? (
                <div className="space-y-4">
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")',
                      backgroundSize: '20px 20px',
                    }}
                  >
                    <img src={processedUrl} alt="Sticker" className="w-full h-full object-contain" />
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {lng === 'de' ? 'Sticker herunterladen' : 'Download Sticker'}
                  </button>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                  <div className="text-center text-zinc-400">
                    <Sticker className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {lng === 'de' ? 'Ihr Sticker erscheint hier' : 'Your sticker will appear here'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden Canvas for Processing */}
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
