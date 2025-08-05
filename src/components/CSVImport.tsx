"use client";

import { useState, useRef } from "react";

interface ImportResult {
  success: boolean;
  message: string;
  results?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

interface CSVImportProps {
  onImportComplete?: (result: ImportResult) => void;
}

export default function CSVImport({ onImportComplete }: CSVImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setImportResult({
          success: false,
          message: "Please select a CSV file"
        });
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
      setValidationResult(null);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const validateCSV = async () => {
    if (!selectedFile) {
      setImportResult({
        success: false,
        message: "Please select a CSV file first"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const csvContent = await readFileContent(selectedFile);
      
      const response = await fetch("/api/fitbit/import/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvContent }),
      });

      const result: ImportResult = await response.json();
      setValidationResult(result);
      
      if (!result.success) {
        setImportResult(result);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : "Validation failed"
      };
      setValidationResult(errorResult);
      setImportResult(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setImportResult({
        success: false,
        message: "Please select a CSV file first"
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const csvContent = await readFileContent(selectedFile);
      
      const response = await fetch("/api/fitbit/import/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvContent }),
      });

      const result: ImportResult = await response.json();
      setImportResult(result);
      
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : "Import failed"
      };
      setImportResult(errorResult);
      
      if (onImportComplete) {
        onImportComplete(errorResult);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImportResult(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        体重・体脂肪データ取り込み
      </h3>
      
      {/* File Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSVファイルを選択
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              選択済み: {selectedFile.name}
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-800"
            >
              クリア
            </button>
          </div>
        )}
      </div>

      {/* CSV Format Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">CSVフォーマット:</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`日付,体重(kg),体脂肪率(%)
2025/5/5,66.0,13.2
2025/5/6,66.0,12.6`}
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={validateCSV}
          disabled={!selectedFile || isValidating || isImporting}
          className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {isValidating ? "検証中..." : "検証"}
        </button>
        
        <button
          onClick={handleImport}
          disabled={!selectedFile || isImporting || isValidating || (validationResult !== null && !validationResult.success)}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {isImporting ? "取り込み中..." : "取り込み"}
        </button>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`mb-4 p-3 rounded-md ${
          validationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            validationResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {validationResult.message}
          </p>
          {validationResult.results && validationResult.results.success > 0 && (
            <p className="text-sm text-green-700 mt-1">
              有効なレコード: {validationResult.results.success}件
            </p>
          )}
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`p-3 rounded-md ${
          importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            importResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {importResult.message}
          </p>
          
          {importResult.results && (
            <div className="mt-2 text-sm">
              {importResult.results.success > 0 && (
                <p className="text-green-700">
                  成功: {importResult.results.success}件
                </p>
              )}
              {importResult.results.failed > 0 && (
                <p className="text-red-700">
                  失敗: {importResult.results.failed}件
                </p>
              )}
              {importResult.results.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-700">エラー詳細:</p>
                  <ul className="list-disc list-inside text-red-600 text-xs max-h-32 overflow-y-auto">
                    {importResult.results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}