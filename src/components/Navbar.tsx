'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Sparkles, Menu, X, ArrowRight, User, LogOut, CreditCard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Language } from '@/i18n/settings';
import LanguageSwitcher from './LanguageSwitcher';
import { ThemeToggle } from './theme-toggle';

interface NavbarProps {
  lng: Language;
}

const navContent = {
  en: {
    tools: 'Tools',
    pricing: 'Pricing',
    faq: 'FAQ',
    about: 'About',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    dashboard: 'Dashboard',
    credits: 'Credits',
    signOut: 'Sign Out',
  },
  de: {
    tools: 'Tools',
    pricing: 'Preise',
    faq: 'FAQ',
    about: 'Über uns',
    signIn: 'Anmelden',
    getStarted: 'Loslegen',
    dashboard: 'Dashboard',
    credits: 'Credits',
    signOut: 'Abmelden',
  },
};

export default function Navbar({ lng }: NavbarProps) {
  const t = navContent[lng];
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: `/${lng}#tools`, label: t.tools },
    { href: `/${lng}/pricing`, label: t.pricing },
    { href: `/${lng}#faq`, label: t.faq },
    { href: `/${lng}/about`, label: t.about },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: `/${lng}` });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-4 left-4 right-4 sm:left-8 sm:right-8 lg:left-16 lg:right-16 z-50"
    >
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href={`/${lng}`} className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
                <Sparkles className="relative h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xl font-semibold text-zinc-900 dark:text-white">
                Pure<span className="text-indigo-600 dark:text-indigo-400">Tools</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-white ${
                    pathname === item.href ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Language & Theme - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <LanguageSwitcher lng={lng} />
                <ThemeToggle />
              </div>

              {/* Auth Section */}
              {status === 'loading' ? (
                <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ) : session ? (
                /* Logged In - User Menu */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="h-7 w-7 rounded-full"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                      {session.user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl py-2"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      {/* Credits */}
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-zinc-500">{t.credits}</span>
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {session.user?.credits ?? 0}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={`/${lng}/dashboard`}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        >
                          <CreditCard className="h-4 w-4" />
                          {t.dashboard}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                        >
                          <LogOut className="h-4 w-4" />
                          {t.signOut}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Not Logged In */
                <>
                  <Link
                    href={`/${lng}/auth/signin`}
                    className="hidden sm:block text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    {t.signIn}
                  </Link>
                  <Link
                    href={`/${lng}/auth/signin`}
                    className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                  >
                    {t.getStarted}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                          <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {session.user?.credits ?? 0} {t.credits}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/${lng}/dashboard`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      {t.dashboard}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      {t.signOut}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${lng}/auth/signin`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      {t.signIn}
                    </Link>
                    <Link
                      href={`/${lng}/auth/signin`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-xl bg-indigo-600 text-center text-sm font-semibold text-white"
                    >
                      {t.getStarted}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Language & Theme */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                <LanguageSwitcher lng={lng} />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
