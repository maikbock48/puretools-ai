'use client';

import { ReactNode } from 'react';

interface EmbedWrapperProps {
  children: ReactNode;
  toolName: string;
}

export default function EmbedWrapper({ children, toolName }: EmbedWrapperProps) {
  return (
    <div className="embed-wrapper min-h-screen bg-white dark:bg-zinc-900 pb-12">
      {/* Tool Content - reduced padding for embed */}
      <div className="embed-content">
        {children}
      </div>

      {/* Powered by footer */}
      <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-gradient-to-t from-white dark:from-zinc-900 via-white/95 dark:via-zinc-900/95 to-transparent">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-zinc-500">
            {toolName} by
          </span>
          <a
            href="https://puretools.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            PureTools.ai
          </a>
          <span className="text-zinc-400">- Free Online Tools</span>
        </div>
      </div>
    </div>
  );
}
