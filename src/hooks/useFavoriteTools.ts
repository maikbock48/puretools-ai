'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'puretools_favorite_tools';

export function useFavoriteTools() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading favorite tools:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorite tools:', error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((toolKey: string) => {
    setFavorites((prev) => {
      if (prev.includes(toolKey)) return prev;
      return [...prev, toolKey];
    });
  }, []);

  const removeFavorite = useCallback((toolKey: string) => {
    setFavorites((prev) => prev.filter((key) => key !== toolKey));
  }, []);

  const toggleFavorite = useCallback((toolKey: string) => {
    setFavorites((prev) => {
      if (prev.includes(toolKey)) {
        return prev.filter((key) => key !== toolKey);
      }
      return [...prev, toolKey];
    });
  }, []);

  const isFavorite = useCallback(
    (toolKey: string) => favorites.includes(toolKey),
    [favorites]
  );

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
