'use client';

import { useState, useCallback } from 'react';

interface WatermarkToggleProps {
  lng: string;
  defaultEnabled?: boolean;
  onChange?: (enabled: boolean) => void;
  className?: string;
}

const translations = {
  en: {
    label: 'Add "Made with PureTools.ai" watermark',
    tooltip: 'Helps others discover this free tool!',
  },
  de: {
    label: '"Made with PureTools.ai" Wasserzeichen hinzufügen',
    tooltip: 'Hilft anderen, dieses kostenlose Tool zu entdecken!',
  },
};

export function WatermarkToggle({
  lng,
  defaultEnabled = true,
  onChange,
  className = '',
}: WatermarkToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const t = translations[lng as keyof typeof translations] || translations.en;

  const handleToggle = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
    onChange?.(newValue);
  }, [enabled, onChange]);

  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none group ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t.label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors">
          {t.tooltip}
        </span>
      </div>
    </label>
  );
}

/**
 * Hook for managing watermark state
 */
export function useWatermark(defaultEnabled = true) {
  const [watermarkEnabled, setWatermarkEnabled] = useState(defaultEnabled);

  const WatermarkToggleComponent = useCallback(
    ({ lng, className }: { lng: string; className?: string }) => (
      <WatermarkToggle
        lng={lng}
        defaultEnabled={watermarkEnabled}
        onChange={setWatermarkEnabled}
        className={className}
      />
    ),
    [watermarkEnabled]
  );

  return {
    watermarkEnabled,
    setWatermarkEnabled,
    WatermarkToggle: WatermarkToggleComponent,
  };
}
