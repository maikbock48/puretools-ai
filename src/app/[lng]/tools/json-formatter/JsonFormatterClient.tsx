'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Braces,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  Trash2,
  FileJson,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface JsonFormatterClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'JSON Formatter',
    subtitle: 'Format, validate, and beautify your JSON data. All processing happens locally in your browser.',
    inputLabel: 'Input JSON',
    inputPlaceholder: 'Paste your JSON here...',
    outputLabel: 'Formatted Output',
    format: 'Format',
    minify: 'Minify',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    clear: 'Clear',
    valid: 'Valid JSON',
    invalid: 'Invalid JSON',
    indentation: 'Indentation',
    spaces: 'spaces',
    tabs: 'tabs',
    features: {
      title: 'Features',
      items: [
        { title: 'Format & Beautify', desc: 'Pretty-print JSON with custom indentation' },
        { title: 'Minify', desc: 'Compress JSON by removing whitespace' },
        { title: 'Validate', desc: 'Real-time JSON syntax validation' },
        { title: 'Privacy First', desc: 'All processing happens in your browser' },
      ],
    },
    sample: 'Load Sample',
  },
  de: {
    title: 'JSON Formatierer',
    subtitle: 'Formatieren, validieren und verschönern Sie Ihre JSON-Daten. Alle Verarbeitung erfolgt lokal in Ihrem Browser.',
    inputLabel: 'Eingabe JSON',
    inputPlaceholder: 'Fügen Sie hier Ihr JSON ein...',
    outputLabel: 'Formatierte Ausgabe',
    format: 'Formatieren',
    minify: 'Minimieren',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    download: 'Herunterladen',
    clear: 'Leeren',
    valid: 'Gültiges JSON',
    invalid: 'Ungültiges JSON',
    indentation: 'Einrückung',
    spaces: 'Leerzeichen',
    tabs: 'Tabs',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Formatieren & Verschönern', desc: 'JSON mit benutzerdefinierter Einrückung formatieren' },
        { title: 'Minimieren', desc: 'JSON durch Entfernen von Leerzeichen komprimieren' },
        { title: 'Validieren', desc: 'Echtzeit JSON-Syntaxvalidierung' },
        { title: 'Datenschutz zuerst', desc: 'Alle Verarbeitung erfolgt in Ihrem Browser' },
      ],
    },
    sample: 'Beispiel laden',
  },
};

const sampleJson = {
  name: "PureTools AI",
  version: "1.0.0",
  features: ["JSON Formatter", "Image Compressor", "PDF Tools"],
  pricing: {
    free: { tools: "local", cost: 0 },
    pro: { tools: "all", cost: 9.99 }
  },
  isPrivacyFirst: true,
  users: null
};

export default function JsonFormatterClient({ lng }: JsonFormatterClientProps) {
  const t = content[lng];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentType, setIndentType] = useState<'spaces' | 'tabs'>('spaces');
  const [indentSize, setIndentSize] = useState(2);

  const validateAndParse = useCallback((jsonString: string): { valid: boolean; data?: unknown; error?: string } => {
    if (!jsonString.trim()) {
      return { valid: false };
    }
    try {
      const data = JSON.parse(jsonString);
      return { valid: true, data };
    } catch (e) {
      return { valid: false, error: (e as Error).message };
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    const result = validateAndParse(value);
    if (!value.trim()) {
      setIsValid(null);
      setError(null);
      setOutput('');
    } else if (result.valid) {
      setIsValid(true);
      setError(null);
    } else {
      setIsValid(false);
      setError(result.error || null);
      setOutput('');
    }
  };

  const formatJson = () => {
    const result = validateAndParse(input);
    if (result.valid && result.data !== undefined) {
      const indent = indentType === 'tabs' ? '\t' : indentSize;
      setOutput(JSON.stringify(result.data, null, indent));
    }
  };

  const minifyJson = () => {
    const result = validateAndParse(input);
    if (result.valid && result.data !== undefined) {
      setOutput(JSON.stringify(result.data));
    }
  };

  const copyToClipboard = async () => {
    const textToCopy = output || input;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadJson = () => {
    const textToDownload = output || input;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setIsValid(null);
  };

  const loadSample = () => {
    const sampleString = JSON.stringify(sampleJson);
    setInput(sampleString);
    handleInputChange(sampleString);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-amber-500/10 p-4">
            <Braces className="h-10 w-10 text-amber-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-400">{t.subtitle}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">{t.inputLabel}</label>
              <div className="flex items-center gap-2">
                {isValid !== null && (
                  <span className={`flex items-center gap-1 text-xs ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isValid ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        {t.valid}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        {t.invalid}
                      </>
                    )}
                  </span>
                )}
                <button
                  onClick={loadSample}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {t.sample}
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="h-80 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              spellCheck={false}
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">{t.outputLabel}</label>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{t.indentation}:</span>
                <select
                  value={indentType}
                  onChange={(e) => setIndentType(e.target.value as 'spaces' | 'tabs')}
                  className="rounded bg-zinc-800 px-2 py-1 text-zinc-300"
                >
                  <option value="spaces">{t.spaces}</option>
                  <option value="tabs">{t.tabs}</option>
                </select>
                {indentType === 'spaces' && (
                  <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="rounded bg-zinc-800 px-2 py-1 text-zinc-300"
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                  </select>
                )}
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              className="h-80 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm text-emerald-400 focus:outline-none"
              spellCheck={false}
            />
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={formatJson}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize2 className="h-4 w-4" />
            {t.format}
          </button>
          <button
            onClick={minifyJson}
            disabled={!isValid}
            className="flex items-center gap-2 rounded-xl bg-zinc-700 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minimize2 className="h-4 w-4" />
            {t.minify}
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!output && !input}
            className="flex items-center gap-2 rounded-xl bg-zinc-700 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t.copy}
              </>
            )}
          </button>
          <button
            onClick={downloadJson}
            disabled={!output && !input}
            className="flex items-center gap-2 rounded-xl bg-zinc-700 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {t.download}
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            {t.clear}
          </button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <FileJson className="mb-2 h-5 w-5 text-amber-400" />
                <h3 className="mb-1 font-medium text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
