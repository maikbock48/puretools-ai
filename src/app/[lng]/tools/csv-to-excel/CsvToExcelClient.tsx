'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Language } from '@/i18n/settings';

interface CsvToExcelClientProps {
  lng: Language;
}

const content = {
  en: {
    title: 'CSV to Excel Converter',
    subtitle: 'Convert CSV files to Excel format locally in your browser. No uploads, 100% private.',
    dropzone: 'Drop a CSV file here or click to upload',
    supported: 'Supports: .csv, .tsv files',
    preview: 'Preview',
    rows: 'rows',
    columns: 'columns',
    download: 'Download Excel',
    downloadCsv: 'Download CSV',
    clear: 'Clear',
    noData: 'No data to preview',
    delimiter: 'Delimiter',
    delimiters: {
      comma: 'Comma (,)',
      semicolon: 'Semicolon (;)',
      tab: 'Tab',
      pipe: 'Pipe (|)',
    },
    firstRowHeader: 'First row is header',
    converting: 'Converting...',
    success: 'Conversion successful!',
    error: 'Error parsing CSV',
    features: {
      title: 'Features',
      items: [
        { title: 'Privacy First', desc: 'All conversion happens in your browser' },
        { title: 'Multiple Delimiters', desc: 'Support for comma, semicolon, tab, pipe' },
        { title: 'Data Preview', desc: 'Preview your data before converting' },
        { title: 'No File Limits', desc: 'Convert files of any size' },
      ],
    },
    pasteHint: 'Or paste CSV data directly:',
    pasteArea: 'Paste CSV data here...',
  },
  de: {
    title: 'CSV zu Excel Konverter',
    subtitle: 'Konvertieren Sie CSV-Dateien lokal in Ihrem Browser zu Excel. Keine Uploads, 100% privat.',
    dropzone: 'CSV-Datei hier ablegen oder klicken zum Hochladen',
    supported: 'Unterstützt: .csv, .tsv Dateien',
    preview: 'Vorschau',
    rows: 'Zeilen',
    columns: 'Spalten',
    download: 'Excel herunterladen',
    downloadCsv: 'CSV herunterladen',
    clear: 'Leeren',
    noData: 'Keine Daten zur Vorschau',
    delimiter: 'Trennzeichen',
    delimiters: {
      comma: 'Komma (,)',
      semicolon: 'Semikolon (;)',
      tab: 'Tab',
      pipe: 'Pipe (|)',
    },
    firstRowHeader: 'Erste Zeile ist Kopfzeile',
    converting: 'Konvertiere...',
    success: 'Konvertierung erfolgreich!',
    error: 'Fehler beim Parsen der CSV',
    features: {
      title: 'Funktionen',
      items: [
        { title: 'Datenschutz zuerst', desc: 'Alle Konvertierung erfolgt in Ihrem Browser' },
        { title: 'Mehrere Trennzeichen', desc: 'Unterstützung für Komma, Semikolon, Tab, Pipe' },
        { title: 'Datenvorschau', desc: 'Vorschau Ihrer Daten vor der Konvertierung' },
        { title: 'Keine Dateilimits', desc: 'Konvertieren Sie Dateien beliebiger Größe' },
      ],
    },
    pasteHint: 'Oder CSV-Daten direkt einfügen:',
    pasteArea: 'CSV-Daten hier einfügen...',
  },
};

type Delimiter = ',' | ';' | '\t' | '|';

export default function CsvToExcelClient({ lng }: CsvToExcelClientProps) {
  const t = content[lng];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvData, setCsvData] = useState<string>('');
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [delimiter, setDelimiter] = useState<Delimiter>(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = useCallback((text: string, delim: Delimiter): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const rows: string[][] = [];

    for (const line of lines) {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delim && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setError(null);

    try {
      const text = await file.text();
      setCsvData(text);

      // Auto-detect delimiter
      const firstLine = text.split(/\r?\n/)[0] || '';
      const delimCounts = {
        ',': (firstLine.match(/,/g) || []).length,
        ';': (firstLine.match(/;/g) || []).length,
        '\t': (firstLine.match(/\t/g) || []).length,
        '|': (firstLine.match(/\|/g) || []).length,
      };

      const detectedDelim = (Object.entries(delimCounts).sort((a, b) => b[1] - a[1])[0][0]) as Delimiter;
      setDelimiter(detectedDelim);

      const parsed = parseCSV(text, detectedDelim);
      setParsedData(parsed);
    } catch {
      setError(t.error);
    }
  }, [parseCSV, t.error]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.type === 'text/csv')) {
      loadFile(file);
    }
  };

  const handlePaste = (text: string) => {
    setCsvData(text);
    setFileName('pasted-data');
    setError(null);

    try {
      const parsed = parseCSV(text, delimiter);
      setParsedData(parsed);
    } catch {
      setError(t.error);
    }
  };

  const handleDelimiterChange = (newDelim: Delimiter) => {
    setDelimiter(newDelim);
    if (csvData) {
      const parsed = parseCSV(csvData, newDelim);
      setParsedData(parsed);
    }
  };

  const downloadExcel = async () => {
    if (parsedData.length === 0) return;

    setIsConverting(true);

    try {
      const XLSX = (await import('xlsx')).default;

      const ws = XLSX.utils.aoa_to_sheet(parsedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\.[^/.]+$/, '')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadCSV = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setCsvData('');
    setParsedData([]);
    setFileName('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-flex rounded-2xl bg-teal-100 dark:bg-teal-500/10 p-4">
            <Table className="h-10 w-10 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-zinc-800 dark:text-white sm:text-4xl">{t.title}</h1>
          <p className="mx-auto max-w-2xl text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload / Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10'
                  : 'border-indigo-300 dark:border-zinc-700 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-zinc-900/50 dark:to-zinc-900/50 hover:border-indigo-400 dark:hover:border-zinc-600'
              }`}
            >
              <Upload className={`mb-2 h-8 w-8 ${isDragging ? 'text-teal-500 dark:text-teal-400' : 'text-indigo-400 dark:text-zinc-500'}`} />
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{t.dropzone}</p>
              <p className="text-xs text-zinc-500">{t.supported}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Or Paste */}
            <div>
              <label className="mb-2 block text-sm text-zinc-600 dark:text-zinc-400">{t.pasteHint}</label>
              <textarea
                value={csvData}
                onChange={(e) => handlePaste(e.target.value)}
                placeholder={t.pasteArea}
                className="h-32 w-full rounded-xl border border-indigo-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 font-mono text-sm text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Settings */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{t.delimiter}:</span>
                <select
                  value={delimiter}
                  onChange={(e) => handleDelimiterChange(e.target.value as Delimiter)}
                  className="rounded-lg bg-indigo-50 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-800 dark:text-white"
                >
                  <option value=",">{t.delimiters.comma}</option>
                  <option value=";">{t.delimiters.semicolon}</option>
                  <option value="	">{t.delimiters.tab}</option>
                  <option value="|">{t.delimiters.pipe}</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded border-indigo-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                />
                {t.firstRowHeader}
              </label>
            </div>

            {/* Status */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {parsedData.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                {parsedData.length} {t.rows}, {parsedData[0]?.length || 0} {t.columns}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadExcel}
                disabled={parsedData.length === 0 || isConverting}
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {isConverting ? t.converting : t.download}
              </button>
              <button
                onClick={downloadCSV}
                disabled={!csvData}
                className="flex items-center gap-2 rounded-xl bg-indigo-100 dark:bg-zinc-700 px-6 py-3 font-medium text-indigo-700 dark:text-white transition-colors hover:bg-indigo-200 dark:hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {t.downloadCsv}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
                {t.clear}
              </button>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.preview}</h3>
            <div className="h-96 overflow-auto rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              {parsedData.length > 0 ? (
                <table className="w-full text-sm">
                  {hasHeader && (
                    <thead className="sticky top-0 bg-indigo-50 dark:bg-zinc-900">
                      <tr>
                        {parsedData[0]?.map((cell, i) => (
                          <th
                            key={i}
                            className="border-b border-indigo-100 dark:border-zinc-800 px-3 py-2 text-left font-medium text-teal-600 dark:text-teal-400"
                          >
                            {cell || `Col ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {(hasHeader ? parsedData.slice(1) : parsedData).slice(0, 100).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-indigo-50 dark:border-zinc-800/50 hover:bg-indigo-50/50 dark:hover:bg-zinc-900/50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-zinc-700 dark:text-zinc-300"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  {t.noData}
                </div>
              )}
            </div>
            {parsedData.length > 100 && (
              <p className="mt-2 text-center text-xs text-zinc-500">
                Showing first 100 rows of {parsedData.length}
              </p>
            )}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="mb-6 text-center text-xl font-semibold text-zinc-800 dark:text-white">{t.features.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-indigo-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
              >
                <FileSpreadsheet className="mb-2 h-5 w-5 text-teal-500 dark:text-teal-400" />
                <h3 className="mb-1 font-medium text-zinc-800 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
