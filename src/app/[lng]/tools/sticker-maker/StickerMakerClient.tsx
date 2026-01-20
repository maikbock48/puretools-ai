'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sticker, Upload, Download, Loader2, Palette, Maximize2 } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface StickerMakerClientProps {
  lng: Language;
}

export default function StickerMakerClient({ lng }: StickerMakerClientProps) {
  const { t } = useTranslation(lng);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [borderWidth, setBorderWidth] = useState(10);
  const [borderColor, setBorderColor] = useState('#ffffff');
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

      // Step 2: Add outline using canvas
      const canvas = canvasRef.current;
      const padding = borderWidth * 2;
      canvas.width = resultImg.width + padding * 2;
      canvas.height = resultImg.height + padding * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the outline by drawing the image multiple times offset in all directions
      ctx.globalCompositeOperation = 'source-over';

      // Create outline by drawing the silhouette in border color
      const offCanvas = document.createElement('canvas');
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) throw new Error('Could not get offscreen canvas context');

      // Draw the image to get its silhouette
      offCtx.drawImage(resultImg, padding, padding);

      // Get image data and create silhouette
      const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imageData.data;

      // Convert border color to RGB
      const hexColor = borderColor.replace('#', '');
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
      offCtx.putImageData(imageData, 0, 0);

      setProgress(90);

      // Draw the outline by drawing the silhouette multiple times in a circle pattern
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        for (let distance = 1; distance <= borderWidth; distance++) {
          const offsetX = Math.cos(angle) * distance;
          const offsetY = Math.sin(angle) * distance;
          ctx.drawImage(offCanvas, offsetX, offsetY);
        }
      }

      // Draw the original image on top
      ctx.drawImage(resultImg, padding, padding);

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
      <div className="max-w-4xl mx-auto">
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
                ? 'Erstellen Sie Sticker mit Umrandung aus Ihren Fotos'
                : 'Create stickers with outlines from your photos'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Settings Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
                {lng === 'de' ? 'Einstellungen' : 'Settings'}
              </h2>

              {/* Border Width */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  <Maximize2 className="h-4 w-4" />
                  {lng === 'de' ? 'Randbreite' : 'Border Width'}: {borderWidth}px
                </label>
                <input
                  type="range"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  min="5"
                  max="30"
                  className="w-full accent-orange-500"
                />
              </div>

              {/* Border Color */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  <Palette className="h-4 w-4" />
                  {lng === 'de' ? 'Randfarbe' : 'Border Color'}
                </label>
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBorderColor(color)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        borderColor === color
                          ? 'border-orange-500 scale-110'
                          : 'border-zinc-300 dark:border-zinc-600'
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

              {/* Upload Area */}
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
                    {lng === 'de'
                      ? 'Bild hierher ziehen oder klicken'
                      : 'Drag & drop image or click'}
                  </p>
                  <p className="text-sm text-zinc-500">
                    JPG, PNG, WebP
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Original Preview */}
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                    {originalUrl && (
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
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
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={clearImage}
                      className="flex-1 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                    >
                      {lng === 'de' ? 'Neu' : 'New'}
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

            {/* Result Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">
                {lng === 'de' ? 'Ergebnis' : 'Result'}
              </h2>

              {processedUrl ? (
                <div className="space-y-4">
                  {/* Result Preview with checkered background */}
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")',
                      backgroundSize: '20px 20px',
                    }}
                  >
                    <img
                      src={processedUrl}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {lng === 'de' ? 'Sticker herunterladen (PNG)' : 'Download Sticker (PNG)'}
                  </button>
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                  <div className="text-center text-zinc-400">
                    <Sticker className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {lng === 'de'
                        ? 'Ihr Sticker erscheint hier'
                        : 'Your sticker will appear here'}
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
