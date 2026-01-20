'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Page Error:', error);

    // Here you could send to error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
          Oops! Something went wrong
        </h1>

        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-8 text-left">
            <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs text-red-500 overflow-auto max-h-48">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-400">
          Error ID: {error.digest || 'unknown'}
        </p>
      </div>
    </div>
  );
}
