import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X, FileSpreadsheet, Table, Folder, Settings } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { exportToExcel, exportToCSV, ExportData, selectDefaultDirectory, getExportSettings, resetExportSettings } from '../utils/exportUtils';

const ImportExport: React.FC = () => {
  const { exportData, importData, items, sales } = useStock();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'excel' | 'csv'>('excel');
  const [exportSettings, setExportSettings] = useState(getExportSettings());
  const [isSelectingDirectory, setIsSelectingDirectory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update export settings when component mounts
  useEffect(() => {
    setExportSettings(getExportSettings());
  }, []);

  const handleSelectDirectory = async () => {
    setIsSelectingDirectory(true);
    try {
      const directoryName = await selectDefaultDirectory();
      if (directoryName) {
        setExportSettings(getExportSettings());
        setImportStatus('success');
        setImportMessage(`Default export directory set to: ${directoryName}`);
      }
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Failed to select directory. Files will be downloaded to your default Downloads folder.');
    } finally {
      setIsSelectingDirectory(false);
    }
  };

  const handleResetDirectory = () => {
    resetExportSettings();
    setExportSettings(getExportSettings());
    setImportStatus('success');
    setImportMessage('Export settings reset. Files will be downloaded to your default Downloads folder.');
  };

  const handleExport = async () => {
    try {
      const data: ExportData = {
        items,
        sales,
        exportDate: new Date().toISOString()
      };

      let result = '';

      switch (exportFormat) {
        case 'excel':
          result = await exportToExcel(data);
          setImportStatus('success');
          setImportMessage(result);
          break;
          
        case 'csv':
          result = exportToCSV(data, 'stock');
          setImportStatus('success');
          setImportMessage(`CSV file exported: ${result}`);
          break;
          
        case 'json':
          const jsonData = exportData();
          const blob = new Blob([jsonData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `stock-data-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setImportStatus('success');
          setImportMessage('JSON file exported successfully!');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus('error');
      setImportMessage('Failed to export data. Please try again.');
    }
  };

  const handleExportSeparate = (type: 'stock' | 'sales' | 'summary') => {
    try {
      const data: ExportData = {
        items,
        sales,
        exportDate: new Date().toISOString()
      };
      
      const result = exportToCSV(data, type);
      setImportStatus('success');
      setImportMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} CSV exported: ${result}`);
    } catch (error) {
      console.error('Export failed:', error);
      setImportStatus('error');
      setImportMessage('Failed to export data. Please try again.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setImportStatus('error');
      setImportMessage('Please select a valid JSON file. Excel/CSV import is not supported yet.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        
        if (success) {
          setImportStatus('success');
          setImportMessage('Data imported successfully!');
        } else {
          setImportStatus('error');
          setImportMessage('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Failed to read file. Please ensure it\'s a valid JSON file.');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearStatus = () => {
    setImportStatus('idle');
    setImportMessage('');
  };

  const stats = [
    {
      title: 'Total Items',
      value: items.length,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sales Records',
      value: sales.length,
      icon: FileText,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Message */}
      {importStatus !== 'idle' && (
        <div className={`rounded-xl p-4 border ${
          importStatus === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {importStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`font-medium ${
                importStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {importMessage}
              </p>
            </div>
            <button
              onClick={clearStatus}
              className={`p-1 rounded-lg hover:bg-opacity-20 transition-colors ${
                importStatus === 'success' 
                  ? 'text-green-600 hover:bg-green-600' 
                  : 'text-red-600 hover:bg-red-600'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-Export Directory Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Folder className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Auto-Export Settings</h3>
            <p className="text-sm text-gray-600">Set a default directory for automatic Excel file saving</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Current Settings:</h4>
              <p className="text-sm text-gray-600 mt-1">
                {exportSettings.autoExport && exportSettings.defaultDirectory ? (
                  <>
                    <span className="text-green-600 font-medium">Auto-export enabled</span>
                    <br />
                    Default directory: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{exportSettings.defaultDirectory}</span>
                    {exportSettings.lastExportPath && (
                      <>
                        <br />
                        Last export: <span className="text-xs text-gray-500">{exportSettings.lastExportPath}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">Auto-export disabled - files will download to your default Downloads folder</span>
                )}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${exportSettings.autoExport ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSelectDirectory}
            disabled={isSelectingDirectory}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Folder className="h-5 w-5" />
            {isSelectingDirectory ? 'Selecting...' : 'Select Default Directory'}
          </button>
          
          {exportSettings.autoExport && (
            <button
              onClick={handleResetDirectory}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <Settings className="h-5 w-5" />
              Reset
            </button>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Browser Compatibility</h4>
              <p className="text-sm text-blue-700">
                Auto-export to custom directories requires a modern browser (Chrome 86+, Edge 86+). 
                If not supported, files will download to your default Downloads folder.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Download className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-600">Download your stock data in various formats</p>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setExportFormat('excel')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportFormat === 'excel'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Excel (.xlsx)</div>
                  <div className="text-sm text-gray-600">
                    {exportSettings.autoExport ? 'Auto-save enabled' : 'Multiple sheets, formatted'}
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('csv')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Table className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">CSV</div>
                  <div className="text-sm text-gray-600">Google Sheets compatible</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('json')}
              className={`p-4 rounded-lg border-2 transition-all ${
                exportFormat === 'json'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">JSON</div>
                  <div className="text-sm text-gray-600">For backup/restore</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Export includes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {exportFormat === 'excel' && (
              <>
                <li>• <strong>Stock Items Sheet:</strong> All inventory with status and details</li>
                <li>• <strong>Sales History Sheet:</strong> Complete sales records with revenue</li>
                <li>• <strong>Summary Sheet:</strong> Key metrics and statistics</li>
                <li>• <strong>Auto-save:</strong> {exportSettings.autoExport ? `Saves to ${exportSettings.defaultDirectory}` : 'Downloads to default folder'}</li>
              </>
            )}
            {exportFormat === 'csv' && (
              <>
                <li>• Stock items with current quantities and status</li>
                <li>• Compatible with Google Sheets, Excel, and other spreadsheet apps</li>
                <li>• Easy to import and manipulate</li>
              </>
            )}
            {exportFormat === 'json' && (
              <>
                <li>• Complete data backup including all fields</li>
                <li>• Can be imported back into Stock Manager</li>
                <li>• Preserves all metadata and timestamps</li>
              </>
            )}
          </ul>
        </div>

        <button
          onClick={handleExport}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export as {exportFormat.toUpperCase()}
          {exportFormat === 'excel' && exportSettings.autoExport && (
            <span className="text-xs bg-blue-500 px-2 py-1 rounded-full ml-2">Auto-save</span>
          )}
        </button>
      </div>

      {/* Separate CSV Exports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <Table className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Individual CSV Exports</h3>
            <p className="text-sm text-gray-600">Export specific data types separately</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExportSeparate('stock')}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <div className="text-center">
              <FileSpreadsheet className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Stock Items</div>
              <div className="text-sm text-gray-600">Inventory data only</div>
            </div>
          </button>

          <button
            onClick={() => handleExportSeparate('sales')}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
          >
            <div className="text-center">
              <FileSpreadsheet className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Sales History</div>
              <div className="text-sm text-gray-600">Sales records only</div>
            </div>
          </button>

          <button
            onClick={() => handleExportSeparate('summary')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <div className="text-center">
              <FileSpreadsheet className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Summary Report</div>
              <div className="text-sm text-gray-600">Key metrics only</div>
            </div>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Upload className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import Data</h3>
            <p className="text-sm text-gray-600">Upload a JSON file to restore your stock data</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                Currently only JSON import is supported. Excel/CSV import will be added in future updates.
                Importing will replace all current data.
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Import JSON Data
        </button>
      </div>

      {/* Google Sheets Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use with Google Sheets</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Method 1 - CSV Export:</strong></p>
          <p>1. Click "Export as CSV" above</p>
          <p>2. Open Google Sheets in your browser</p>
          <p>3. Click "File" → "Import" → "Upload" → Select your CSV file</p>
          <p>4. Choose "Replace spreadsheet" and click "Import data"</p>
          
          <p className="mt-4"><strong>Method 2 - Excel Export:</strong></p>
          <p>1. Click "Export as XLSX" above</p>
          <p>2. Open Google Sheets → "File" → "Import" → "Upload"</p>
          <p>3. Select your Excel file and import</p>
          
          <p className="mt-4"><strong>Auto-Export Feature:</strong></p>
          <p>• Set a default directory once, then all Excel exports save there automatically</p>
          <p>• Perfect for regular backups to a specific folder</p>
          <p>• Works with cloud storage folders (Dropbox, OneDrive, etc.)</p>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;