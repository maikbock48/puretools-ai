import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <FileQuestion className="h-10 w-10 text-zinc-400" />
        </div>

        <h1 className="text-6xl font-bold text-zinc-900 dark:text-white mb-4">404</h1>

        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Page Not Found
        </h2>

        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>

          <Link
            href="/#tools"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold rounded-xl transition-colors"
          >
            <Search className="h-5 w-5" />
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
