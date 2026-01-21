/**
 * Watermark utility for adding "Made with PureTools.ai" to images
 * Used for viral growth - links back to site when images are shared
 */

export interface WatermarkOptions {
  text?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  fontSize?: number;
  opacity?: number;
  padding?: number;
  backgroundColor?: string;
  textColor?: string;
}

const DEFAULT_OPTIONS: Required<WatermarkOptions> = {
  text: 'Made with PureTools.ai',
  position: 'bottom-right',
  fontSize: 14,
  opacity: 0.8,
  padding: 8,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  textColor: '#ffffff',
};

/**
 * Add watermark to an image blob
 * Returns a new blob with the watermark applied
 */
export async function addWatermarkToImage(
  imageBlob: Blob,
  options: WatermarkOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Set up text styling
      ctx.font = `${opts.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.globalAlpha = opts.opacity;

      const textMetrics = ctx.measureText(opts.text);
      const textWidth = textMetrics.width;
      const textHeight = opts.fontSize;
      const boxWidth = textWidth + opts.padding * 2;
      const boxHeight = textHeight + opts.padding * 2;

      // Calculate position
      let x: number;
      const y = canvas.height - boxHeight - opts.padding;

      switch (opts.position) {
        case 'bottom-left':
          x = opts.padding;
          break;
        case 'bottom-center':
          x = (canvas.width - boxWidth) / 2;
          break;
        case 'bottom-right':
        default:
          x = canvas.width - boxWidth - opts.padding;
          break;
      }

      // Draw background box with rounded corners
      ctx.fillStyle = opts.backgroundColor;
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + boxWidth - radius, y);
      ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
      ctx.lineTo(x + boxWidth, y + boxHeight - radius);
      ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - radius, y + boxHeight);
      ctx.lineTo(x + radius, y + boxHeight);
      ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Draw text
      ctx.globalAlpha = 1;
      ctx.fillStyle = opts.textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.text, x + opts.padding, y + boxHeight / 2);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        imageBlob.type || 'image/png',
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Add watermark to a data URL
 * Returns a new data URL with the watermark applied
 */
export async function addWatermarkToDataUrl(
  dataUrl: string,
  options: WatermarkOptions = {}
): Promise<string> {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Add watermark
  const watermarkedBlob = await addWatermarkToImage(blob, options);

  // Convert back to data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(watermarkedBlob);
  });
}

/**
 * Download helper that optionally adds watermark
 */
export async function downloadWithWatermark(
  imageSource: Blob | string,
  filename: string,
  addWatermark: boolean = true,
  options: WatermarkOptions = {}
): Promise<void> {
  let finalBlob: Blob;

  if (typeof imageSource === 'string') {
    // Data URL
    const response = await fetch(imageSource);
    const blob = await response.blob();
    finalBlob = addWatermark ? await addWatermarkToImage(blob, options) : blob;
  } else {
    // Blob
    finalBlob = addWatermark ? await addWatermarkToImage(imageSource, options) : imageSource;
  }

  // Create download link
  const url = URL.createObjectURL(finalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
