'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Copy, Check, X, Users } from 'lucide-react';

interface ReferralBannerProps {
  userId?: string;
  lng: string;
}

export default function ReferralBanner({ userId, lng }: ReferralBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (userId) {
        try {
          const response = await fetch('/api/referral/code');
          if (response.ok) {
            const data = await response.json();
            setReferralCode(data.code);
          }
        } catch (error) {
          console.error('Failed to fetch referral code:', error);
          // Fallback to generated code
          setReferralCode(`REF${userId.slice(0, 8).toUpperCase()}`);
        }
      } else {
        // Guest code for non-logged-in users
        setReferralCode(`GUEST${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      }
    };

    fetchReferralCode();

    // Show banner after some interaction
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('referral-banner-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, [userId]);

  const referralLink = `https://puretools.ai/${lng}?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem('referral-banner-dismissed', 'true');
  };

  const texts = {
    en: {
      title: 'Share PureTools & Earn Credits',
      description: 'Invite friends and both get 100 free credits when they sign up!',
      cta: 'Copy Referral Link',
      copied: 'Copied!',
    },
    de: {
      title: 'Teile PureTools & Erhalte Credits',
      description: 'Lade Freunde ein und ihr beide erhaltet 100 kostenlose Credits!',
      cta: 'Empfehlungslink kopieren',
      copied: 'Kopiert!',
    },
  };

  const t = texts[lng as keyof typeof texts] || texts.en;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40"
        >
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-5 text-white">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-white/10 rounded-xl">
                <Gift className="h-7 w-7" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{t.title}</h3>
                <p className="text-sm text-white/80 mt-1">{t.description}</p>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm font-mono truncate">
                    {referralLink}
                  </div>
                  <button
                    onClick={copyLink}
                    className="flex-shrink-0 px-4 py-2 bg-white text-indigo-600 font-medium rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t.cta}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                  <Users className="h-3 w-3" />
                  <span>1,234 users already earned credits</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
