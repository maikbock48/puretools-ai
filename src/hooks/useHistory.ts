'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface SaveToHistoryParams {
  toolType: string;
  title?: string;
  inputData?: Record<string, unknown>;
  outputData?: Record<string, unknown>;
  previewUrl?: string;
}

export function useHistory() {
  const { data: session } = useSession();

  const saveToHistory = useCallback(
    async (params: SaveToHistoryParams): Promise<{ success: boolean; id?: string }> => {
      // Only save if user is authenticated
      if (!session?.user?.id) {
        return { success: false };
      }

      try {
        const response = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (response.ok) {
          const data = await response.json();
          return { success: true, id: data.id };
        }

        return { success: false };
      } catch (error) {
        console.error('Failed to save to history:', error);
        return { success: false };
      }
    },
    [session?.user?.id]
  );

  return { saveToHistory, isAuthenticated: !!session?.user?.id };
}
