'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Link2,
  Check,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  toolUrl: string;
  lng: string;
  resultPreview?: string; // Optional preview text of what was created
}

const texts = {
  en: {
    title: 'Share your success!',
    subtitle: 'Help others discover this free tool',
    shareText: 'Just used {tool} on PureTools.ai - works great! Try it:',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    maybeLater: 'Maybe later',
    thankYou: 'Thanks for sharing!',
  },
  de: {
    title: 'Teile deinen Erfolg!',
    subtitle: 'Hilf anderen, dieses kostenlose Tool zu entdecken',
    shareText: 'Gerade {tool} auf PureTools.ai benutzt - funktioniert super! Probier es:',
    copyLink: 'Link kopieren',
    copied: 'Kopiert!',
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    whatsapp: 'WhatsApp',
    maybeLater: 'Vielleicht später',
    thankYou: 'Danke fürs Teilen!',
  },
};

export default function ShareModal({
  isOpen,
  onClose,
  toolName,
  toolUrl,
  lng,
  resultPreview,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const t = texts[lng as keyof typeof texts] || texts.en;
  const shareText = t.shareText.replace('{tool}', toolName);
  const fullUrl = `https://puretools.ai${toolUrl}`;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setHasShared(false);
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(fullUrl);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setHasShared(true);

    // Track share event (if analytics is set up)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'tool',
        item_id: toolUrl,
      });
    }
  };

  const socialButtons = [
    { id: 'twitter', icon: Twitter, color: 'bg-[#1DA1F2] hover:bg-[#1a8cd8]', label: t.twitter },
    { id: 'facebook', icon: Facebook, color: 'bg-[#4267B2] hover:bg-[#365899]', label: t.facebook },
    { id: 'linkedin', icon: Linkedin, color: 'bg-[#0A66C2] hover:bg-[#084d94]', label: t.linkedin },
    { id: 'whatsapp', icon: MessageCircle, color: 'bg-[#25D366] hover:bg-[#1da851]', label: t.whatsapp },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors z-10"
            >
              <X className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>

            <div className="relative p-6 pt-8">
              {/* Success animation */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"
                >
                  {hasShared ? (
                    <Check className="h-8 w-8 text-white" />
                  ) : (
                    <Share2 className="h-8 w-8 text-white" />
                  )}
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  {hasShared ? t.thankYou : t.title}
                </h3>
                {!hasShared && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {t.subtitle}
                  </p>
                )}
              </div>

              {/* Result preview (if provided) */}
              {resultPreview && !hasShared && (
                <div className="mb-6 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span className="truncate">{resultPreview}</span>
                  </div>
                </div>
              )}

              {/* Social buttons */}
              {!hasShared && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {socialButtons.map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        onClick={() => handleShare(btn.id)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition-all ${btn.color} shadow-lg shadow-black/10`}
                      >
                        <Icon className="h-5 w-5" />
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Copy link button */}
              {!hasShared && (
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5 text-emerald-500" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Link2 className="h-5 w-5" />
                      {t.copyLink}
                    </>
                  )}
                </button>
              )}

              {/* Maybe later / Close */}
              <button
                onClick={onClose}
                className="w-full mt-3 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {hasShared ? '✓ ' : ''}{t.maybeLater}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy integration into tools
export function useShareModal(toolName: string, toolUrl: string, lng: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [resultPreview, setResultPreview] = useState<string | undefined>();

  const openShareModal = (preview?: string) => {
    setResultPreview(preview);
    setIsOpen(true);
  };

  const closeShareModal = () => {
    setIsOpen(false);
  };

  const ShareModalComponent = () => (
    <ShareModal
      isOpen={isOpen}
      onClose={closeShareModal}
      toolName={toolName}
      toolUrl={toolUrl}
      lng={lng}
      resultPreview={resultPreview}
    />
  );

  return { openShareModal, closeShareModal, ShareModalComponent };
}
