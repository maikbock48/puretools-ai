'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  Copy,
  Download,
  CheckCircle,
  Sparkles,
  Trash2,
  Settings2,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface CodeBeautifierClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'Code Beautifier',
    subtitle: 'Format and beautify your code locally. Supports JavaScript, TypeScript, HTML, CSS, JSON, and more.',
    inputLabel: 'Input Code',
    inputPlaceholder: 'Paste your code here...',
    outputLabel: 'Formatted Code',
    beautify: 'Beautify Code',
    copy: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    clear: 'Clear',
    language: 'Language',
    tabWidth: 'Tab Width',
    useTabs: 'Use Tabs',
    semicolons: 'Semicolons',
    singleQuotes: 'Single Quotes',
    trailingComma: 'Trailing Comma',
    languages: {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      markdown: 'Markdown',
      yaml: 'YAML',
    },
    features: {
      title: 'Features',
      items: [
        { title: 'Multi-Language', desc: 'Support for 7+ programming languages' },
        { title: 'Customizable', desc: 'Configure tabs, quotes, and more' },
        { title: 'Privacy First', desc: 'All formatting happens in your browser' },
        { title: 'Instant Results', desc: 'Format code with one click' },
      ],
    },
    sample: 'Load Sample',
  },
  de: {
    title: 'Code Verschönerer',
    subtitle: 'Formatieren und verschönern Sie Ihren Code lokal. Unterstützt JavaScript, TypeScript, HTML, CSS, JSON und mehr.',
    inputLabel: 'Eingabe Code',
    inputPlaceholder: 'Fügen Sie hier Ihren Code ein...',
    outputLabel: 'Formatierter Code',
    beautify: 'Code verschönern',
    copy: 'Kopieren',
    copied: 'Kopiert!',
    download: 'Herunterladen',
    clear: 'Leeren',
    language: 'Sprache',
    tabWidth: 'Tab-Breite',
    useTabs: 'Tabs verwenden',
    semicolons: 'Semikolons',
    singleQuotes: 'Einfache Anführungszeichen',
    trailingComma: 'Abschließendes Komma',
    languages: {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      html: 'HTML',
      css: 'CSS',
      json: 'JSON',
      markdown: 'Markdown',
      yaml: 'YAML',
    },
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Multi-Sprache', desc: 'Unterstützung für 7+ Programmiersprachen' },
        { title: 'Anpassbar', desc: 'Tabs, Anführungszeichen und mehr konfigurieren' },
        { title: 'Datenschutz zuerst', desc: 'Alle Formatierung erfolgt in Ihrem Browser' },
        { title: 'Sofortige Ergebnisse', desc: 'Code mit einem Klick formatieren' },
      ],
    },
    sample: 'Beispiel laden',
  },
};

type CodeLanguage = 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'markdown' | 'yaml';

const sampleCode: Record<CodeLanguage, string> = {
  javascript: `const greeting=(name)=>{console.log("Hello, "+name+"!");return{message:"Welcome",timestamp:Date.now()}}
const users=[{name:"Alice",age:30},{name:"Bob",age:25}];users.forEach(u=>greeting(u.name))`,
  typescript: `interface User{name:string;age:number;email?:string}
const createUser=(data:Partial<User>):User=>{return{name:data.name||"Anonymous",age:data.age||0,...data}}`,
  html: `<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello World</h1><p>This is a paragraph.</p></div></body></html>`,
  css: `.container{display:flex;flex-direction:column;align-items:center;padding:20px;background-color:#f0f0f0}.title{font-size:24px;color:#333;margin-bottom:10px}`,
  json: `{"name":"PureTools","version":"1.0.0","features":["formatting","validation","conversion"],"config":{"theme":"dark","language":"en"}}`,
  markdown: `# Heading\n## Subheading\nThis is a paragraph with **bold** and *italic* text.\n- Item 1\n- Item 2\n- Item 3`,
  yaml: `name: PureTools\nversion: 1.0.0\nfeatures:\n  - formatting\n  - validation\nconfig:\n  theme: dark\n  language: en`,
};

const fileExtensions: Record<CodeLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'md',
  yaml: 'yaml',
};

export default function CodeBeautifierClient({ lng }: CodeBeautifierClientProps) {
  const t = content[lng];
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>('javascript');
  const [tabWidth, setTabWidth] = useState(2);
  const [useTabs, setUseTabs] = useState(false);
  const [semi, setSemi] = useState(true);
  const [singleQuote, setSingleQuote] = useState(false);
  const [trailingComma, setTrailingComma] = useState<'none' | 'all'>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const beautifyCode = useCallback(async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const prettier = await import('prettier/standalone');
      const parserBabel = await import('prettier/plugins/babel');
      const parserEstree = await import('prettier/plugins/estree');
      const parserHtml = await import('prettier/plugins/html');
      const parserCss = await import('prettier/plugins/postcss');
      const parserMarkdown = await import('prettier/plugins/markdown');
      const parserYaml = await import('prettier/plugins/yaml');
      const parserTypescript = await import('prettier/plugins/typescript');

      const plugins = [
        parserBabel.default,
        parserEstree.default,
        parserHtml.default,
        parserCss.default,
        parserMarkdown.default,
        parserYaml.default,
        parserTypescript.default,
      ];

      const parserMap: Record<CodeLanguage, string> = {
        javascript: 'babel',
        typescript: 'typescript',
        html: 'html',
        css: 'css',
        json: 'json',
        markdown: 'markdown',
        yaml: 'yaml',
      };

      const formatted = await prettier.format(input, {
        parser: parserMap[codeLanguage],
        plugins,
        tabWidth,
        useTabs,
        semi,
        singleQuote,
        trailingComma,
        printWidth: 80,
      });

      setOutput(formatted);
    } catch (err) {
      console.error('Formatting error:', err);
      setError((err as Error).message);
      setOutput('');
    } finally {
      setIsProcessing(false);
    }
  }, [input, codeLanguage, tabWidth, useTabs, semi, singleQuote, trailingComma]);

  const copyToClipboard = async () => {
    const textToCopy = output || input;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCode = () => {
    const textToDownload = output || input;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formatted.${fileExtensions[codeLanguage]}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadSample = () => {
    setInput(sampleCode[codeLanguage]);
    setOutput('');
    setError(null);
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
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-500/10 p-4">
            <Code2 className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-400">{t.subtitle}</p>
        </motion.div>

        {/* Settings Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{t.language}:</span>
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value as CodeLanguage)}
              className="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-white"
            >
              {Object.entries(t.languages).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{t.tabWidth}:</span>
            <select
              value={tabWidth}
              onChange={(e) => setTabWidth(Number(e.target.value))}
              className="rounded-lg bg-zinc-800 px-2 py-1 text-sm text-white"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={useTabs}
              onChange={(e) => setUseTabs(e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800"
            />
            {t.useTabs}
          </label>
          {(codeLanguage === 'javascript' || codeLanguage === 'typescript') && (
            <>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={semi}
                  onChange={(e) => setSemi(e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-800"
                />
                {t.semicolons}
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={singleQuote}
                  onChange={(e) => setSingleQuote(e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-800"
                />
                {t.singleQuotes}
              </label>
            </>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">{t.inputLabel}</label>
              <button
                onClick={loadSample}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                {t.sample}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="h-80 w-full rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              spellCheck={false}
            />
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">{t.outputLabel}</label>
            </div>
            <textarea
              value={output}
              readOnly
              className="h-80 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm text-emerald-400 focus:outline-none"
              spellCheck={false}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          <button
            onClick={beautifyCode}
            disabled={!input.trim() || isProcessing}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isProcessing ? '...' : t.beautify}
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
            onClick={downloadCode}
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
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <Code2 className="mb-2 h-5 w-5 text-emerald-400" />
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
