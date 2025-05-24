import { useState } from 'react';
import { TokenResponse } from '@react-oauth/google';

interface GoogleExportProps {
  data: any[][];
  title: string;
  sheetName?: string;
  token: TokenResponse;
  sourceSpreadsheetId?: string;
  setSourceSpreadsheetId: (id: string) => void;
}

export function GoogleExport({ data, title, sheetName, token, sourceSpreadsheetId, setSourceSpreadsheetId }: GoogleExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          data,
          title,
          sheetName,
          spreadsheetId: sourceSpreadsheetId,
          append: !!sourceSpreadsheetId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to export to Google Sheets');
      }

      const result = await response.json();
      setExportUrl(result.url);
      setSourceSpreadsheetId(result.spreadsheetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? 'Exporting...' : sourceSpreadsheetId ? 'Update Google Sheet' : 'Export to Google Sheets'}
      </button>
      
      {error && (
        <p className="text-red-500">{error}</p>
      )}
      
      {exportUrl && (
        <div>
          <p className="text-green-500">Export successful!</p>
          <a
            href={exportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Open in Google Sheets
          </a>
        </div>
      )}
    </div>
  );
} 