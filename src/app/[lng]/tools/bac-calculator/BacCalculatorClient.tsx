'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wine, Plus, Trash2, AlertTriangle, Clock, User, Globe } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import { Language } from '@/i18n/settings';

interface BacCalculatorClientProps {
  lng: Language;
}

interface Drink {
  id: string;
  type: string;
  amount: number; // in ml
  alcoholPercent: number;
}

type CountryCode = 'DE' | 'GB' | 'US' | 'ES' | 'FR' | 'PL';

interface DrivingLimit {
  country: CountryCode;
  flag: string;
  name: { en: string; de: string };
  limits: {
    label: { en: string; de: string };
    value: string;
  }[];
}

const DRIVING_LIMITS: DrivingLimit[] = [
  {
    country: 'DE',
    flag: '🇩🇪',
    name: { en: 'Germany', de: 'Deutschland' },
    limits: [
      { label: { en: 'Novice drivers (< 21 years)', de: 'Fahranfänger (< 21 Jahre)' }, value: '0.0‰' },
      { label: { en: 'General limit', de: 'Allgemeines Limit' }, value: '0.5‰' },
      { label: { en: 'Absolute driving incapacity', de: 'Absolute Fahruntüchtigkeit' }, value: '1.1‰' },
    ],
  },
  {
    country: 'GB',
    flag: '🇬🇧',
    name: { en: 'United Kingdom', de: 'Großbritannien' },
    limits: [
      { label: { en: 'England, Wales, Northern Ireland', de: 'England, Wales, Nordirland' }, value: '0.8‰' },
      { label: { en: 'Scotland', de: 'Schottland' }, value: '0.5‰' },
    ],
  },
  {
    country: 'US',
    flag: '🇺🇸',
    name: { en: 'United States', de: 'USA' },
    limits: [
      { label: { en: 'Under 21 years (Zero Tolerance)', de: 'Unter 21 Jahre (Null-Toleranz)' }, value: '0.0‰ - 0.2‰' },
      { label: { en: 'General limit (all states)', de: 'Allgemeines Limit (alle Staaten)' }, value: '0.8‰' },
      { label: { en: 'Commercial drivers', de: 'Berufskraftfahrer' }, value: '0.4‰' },
    ],
  },
  {
    country: 'ES',
    flag: '🇪🇸',
    name: { en: 'Spain', de: 'Spanien' },
    limits: [
      { label: { en: 'Novice drivers (< 2 years license)', de: 'Fahranfänger (< 2 Jahre Führerschein)' }, value: '0.3‰' },
      { label: { en: 'General limit', de: 'Allgemeines Limit' }, value: '0.5‰' },
      { label: { en: 'Professional drivers', de: 'Berufskraftfahrer' }, value: '0.3‰' },
    ],
  },
  {
    country: 'FR',
    flag: '🇫🇷',
    name: { en: 'France', de: 'Frankreich' },
    limits: [
      { label: { en: 'Novice drivers (< 3 years license)', de: 'Fahranfänger (< 3 Jahre Führerschein)' }, value: '0.2‰' },
      { label: { en: 'General limit', de: 'Allgemeines Limit' }, value: '0.5‰' },
      { label: { en: 'Bus and truck drivers', de: 'Bus- und LKW-Fahrer' }, value: '0.2‰' },
    ],
  },
  {
    country: 'PL',
    flag: '🇵🇱',
    name: { en: 'Poland', de: 'Polen' },
    limits: [
      { label: { en: 'General limit', de: 'Allgemeines Limit' }, value: '0.2‰' },
      { label: { en: 'Criminal offense threshold', de: 'Straftatbestand ab' }, value: '0.5‰' },
    ],
  },
];

const DRINK_PRESETS = {
  en: [
    { name: 'Beer (500ml)', amount: 500, percent: 5 },
    { name: 'Wine (200ml)', amount: 200, percent: 12 },
    { name: 'Shot (40ml)', amount: 40, percent: 40 },
    { name: 'Cocktail (250ml)', amount: 250, percent: 12 },
    { name: 'Champagne (150ml)', amount: 150, percent: 12 },
  ],
  de: [
    { name: 'Bier (500ml)', amount: 500, percent: 5 },
    { name: 'Wein (200ml)', amount: 200, percent: 12 },
    { name: 'Schnaps (40ml)', amount: 40, percent: 40 },
    { name: 'Cocktail (250ml)', amount: 250, percent: 12 },
    { name: 'Sekt (150ml)', amount: 150, percent: 12 },
  ],
};

export default function BacCalculatorClient({ lng }: BacCalculatorClientProps) {
  const { t } = useTranslation(lng);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(70);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [drinkingHours, setDrinkingHours] = useState(1);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('DE');

  const presets = DRINK_PRESETS[lng] || DRINK_PRESETS.en;

  const addDrink = (preset: typeof presets[0]) => {
    const newDrink: Drink = {
      id: Math.random().toString(36).substr(2, 9),
      type: preset.name,
      amount: preset.amount,
      alcoholPercent: preset.percent,
    };
    setDrinks([...drinks, newDrink]);
  };

  const removeDrink = (id: string) => {
    setDrinks(drinks.filter((d) => d.id !== id));
  };

  const clearAllDrinks = () => {
    setDrinks([]);
  };

  // Calculate BAC using Widmark formula
  const bac = useMemo(() => {
    if (drinks.length === 0) return 0;

    // Calculate total alcohol in grams
    // Alcohol density: 0.789 g/ml
    const totalAlcoholGrams = drinks.reduce((sum, drink) => {
      const pureAlcoholMl = (drink.amount * drink.alcoholPercent) / 100;
      const alcoholGrams = pureAlcoholMl * 0.789;
      return sum + alcoholGrams;
    }, 0);

    // Widmark factor: 0.68 for men, 0.55 for women
    const widmarkFactor = gender === 'male' ? 0.68 : 0.55;

    // Calculate BAC (in per mille / promille)
    // Formula: BAC = (alcohol in grams) / (body weight in kg * Widmark factor)
    let calculatedBac = totalAlcoholGrams / (weight * widmarkFactor);

    // Subtract alcohol metabolism over time (approximately 0.15 per mille per hour)
    const metabolizedAlcohol = drinkingHours * 0.15;
    calculatedBac = Math.max(0, calculatedBac - metabolizedAlcohol);

    return calculatedBac;
  }, [drinks, gender, weight, drinkingHours]);

  const getBacStatus = () => {
    if (bac === 0) return { color: 'emerald', label: lng === 'de' ? 'Nüchtern' : 'Sober' };
    if (bac < 0.3) return { color: 'emerald', label: lng === 'de' ? 'Minimal' : 'Minimal' };
    if (bac < 0.5) return { color: 'yellow', label: lng === 'de' ? 'Leicht' : 'Light' };
    if (bac < 0.8) return { color: 'orange', label: lng === 'de' ? 'Merklich' : 'Noticeable' };
    if (bac < 1.1) return { color: 'red', label: lng === 'de' ? 'Erheblich' : 'Significant' };
    if (bac < 1.6) return { color: 'red', label: lng === 'de' ? 'Stark' : 'Strong' };
    return { color: 'red', label: lng === 'de' ? 'Gefährlich' : 'Dangerous' };
  };

  const status = getBacStatus();

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'yellow': return 'bg-yellow-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'yellow': return 'text-yellow-600 dark:text-yellow-400';
      case 'orange': return 'text-orange-600 dark:text-orange-400';
      case 'red': return 'text-red-600 dark:text-red-400';
      default: return 'text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white mb-4">
              <Wine className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {lng === 'de' ? 'Promillerechner' : 'BAC Calculator'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {lng === 'de'
                ? 'Schätzen Sie Ihren Blutalkoholgehalt'
                : 'Estimate your blood alcohol content'}
            </p>
          </div>

          {/* Disclaimer */}
          {showDisclaimer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl"
            >
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    {lng === 'de' ? 'Wichtiger Hinweis' : 'Important Disclaimer'}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {lng === 'de'
                      ? 'Dieser Rechner dient nur zu Informationszwecken. Die tatsächliche Blutalkoholkonzentration kann von vielen Faktoren abhängen. Fahren Sie niemals unter Alkoholeinfluss! Dieser Rechner ersetzt keine professionelle Messung.'
                      : 'This calculator is for informational purposes only. Actual blood alcohol levels can vary based on many factors. Never drink and drive! This calculator does not replace professional measurement.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                {lng === 'de' ? 'Persönliche Daten' : 'Personal Data'}
              </h2>

              {/* Gender Selection */}
              <div className="mb-4">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                  {lng === 'de' ? 'Geschlecht' : 'Gender'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGender('male')}
                    className={`py-2 rounded-lg border transition-all ${
                      gender === 'male'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {lng === 'de' ? 'Männlich' : 'Male'}
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`py-2 rounded-lg border transition-all ${
                      gender === 'female'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {lng === 'de' ? 'Weiblich' : 'Female'}
                  </button>
                </div>
              </div>

              {/* Weight */}
              <div className="mb-4">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                  {lng === 'de' ? 'Gewicht (kg)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(30, Math.min(200, parseInt(e.target.value) || 70)))}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  min="30"
                  max="200"
                />
              </div>

              {/* Drinking Time */}
              <div className="mb-6">
                <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {lng === 'de' ? 'Trinkdauer (Stunden)' : 'Drinking time (hours)'}
                </label>
                <input
                  type="range"
                  value={drinkingHours}
                  onChange={(e) => setDrinkingHours(parseFloat(e.target.value))}
                  min="0"
                  max="12"
                  step="0.5"
                  className="w-full accent-purple-500"
                />
                <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {drinkingHours} {lng === 'de' ? 'Stunden' : 'hours'}
                </div>
              </div>

              {/* Drink Presets */}
              <h3 className="font-medium text-zinc-900 dark:text-white mb-3">
                {lng === 'de' ? 'Getränk hinzufügen' : 'Add drink'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => addDrink(preset)}
                    className="p-2 text-sm text-left rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center gap-2 text-zinc-700 dark:text-zinc-300"
                  >
                    <Plus className="h-4 w-4 text-purple-500" />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
              {/* BAC Display */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  {lng === 'de' ? 'Geschätzter Promillewert' : 'Estimated BAC'}
                </div>
                <div className={`text-5xl font-bold mb-2 ${getTextColorClass(status.color)}`}>
                  {bac.toFixed(2)}‰
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getColorClass(status.color)} text-white`}>
                  {status.label}
                </div>

                {/* BAC Gauge */}
                <div className="mt-6 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getColorClass(status.color)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (bac / 2) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>0‰</span>
                  <span>0.5‰</span>
                  <span>1.0‰</span>
                  <span>1.5‰</span>
                  <span>2.0‰</span>
                </div>
              </div>

              {/* Drinks List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {lng === 'de' ? 'Getränke' : 'Drinks'} ({drinks.length})
                  </h3>
                  {drinks.length > 0 && (
                    <button
                      onClick={clearAllDrinks}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      {lng === 'de' ? 'Alle löschen' : 'Clear all'}
                    </button>
                  )}
                </div>

                {drinks.length === 0 ? (
                  <p className="text-center text-zinc-500 dark:text-zinc-400 py-4">
                    {lng === 'de'
                      ? 'Noch keine Getränke hinzugefügt'
                      : 'No drinks added yet'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {drinks.map((drink) => (
                      <div
                        key={drink.id}
                        className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-white">
                            {drink.type}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {drink.alcoholPercent}% vol
                          </div>
                        </div>
                        <button
                          onClick={() => removeDrink(drink.id)}
                          className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Info with Country Selector */}
              <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">
                    {lng === 'de' ? 'Grenzwerte nach Land:' : 'Limits by country:'}
                  </span>
                </div>

                {/* Country Tabs */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {DRIVING_LIMITS.map((country) => (
                    <button
                      key={country.country}
                      onClick={() => setSelectedCountry(country.country)}
                      className={`px-2 py-1 text-xs rounded-lg transition-all flex items-center gap-1 ${
                        selectedCountry === country.country
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span className="hidden sm:inline">{country.name[lng]}</span>
                    </button>
                  ))}
                </div>

                {/* Selected Country Limits */}
                {(() => {
                  const countryData = DRIVING_LIMITS.find((c) => c.country === selectedCountry);
                  if (!countryData) return null;
                  return (
                    <div>
                      <p className="font-medium mb-2 flex items-center gap-2">
                        <span>{countryData.flag}</span>
                        {countryData.name[lng]}
                      </p>
                      <ul className="space-y-1 text-xs">
                        {countryData.limits.map((limit, index) => (
                          <li key={index} className="flex justify-between">
                            <span>• {limit.label[lng]}</span>
                            <span className="font-medium text-purple-600 dark:text-purple-400">{limit.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t('common.privacyNote')}
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p className="font-medium">
                  {lng === 'de' ? 'Alle Angaben ohne Gewähr' : 'All information without guarantee'}
                </p>
                <p>
                  {lng === 'de'
                    ? 'Die berechneten Werte sind lediglich Schätzungen und können von der tatsächlichen Blutalkoholkonzentration abweichen. Dieser Rechner ersetzt keine professionelle Messung und dient ausschließlich zu Informationszwecken.'
                    : 'The calculated values are estimates only and may differ from actual blood alcohol concentration. This calculator does not replace professional measurement and is for informational purposes only.'}
                </p>
                <p>
                  {lng === 'de'
                    ? 'Beachten Sie, dass sich die gesetzlichen Grenzwerte und Regelungen jederzeit ändern können. Informieren Sie sich stets über die aktuell geltende Gesetzeslage in Ihrem Land.'
                    : 'Please note that legal limits and regulations may change at any time. Always inform yourself about the currently applicable laws in your country.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
