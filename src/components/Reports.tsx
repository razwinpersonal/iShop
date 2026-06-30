import React, { useState } from 'react';
import { FileText, Upload, Package, AlertTriangle, TrendingUp, Settings, AlertCircle } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { generatePDFReport, uploadToGoogleDrive, initializeGoogleDrive } from '../utils/reportUtils';

const Reports: React.FC = () => {
  const { items, sales } = useStock();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [reportType, setReportType] = useState('stock-summary');
  const [autoUpload, setAutoUpload] = useState(false); // Changed default to false
  const [lastUpload, setLastUpload] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'stock-summary',
      title: 'Stock Summary',
      description: 'Current inventory levels and low stock alerts',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alert',
      description: 'Items that need immediate restocking',
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      id: 'sales-report',
      title: 'Sales Report',
      description: 'Sales history and performance metrics',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      id: 'complete-inventory',
      title: 'Complete Inventory',
      description: 'Full product catalog with all details',
      icon: FileText,
      color: 'bg-purple-500',
    },
  ];

  const handleConnectDrive = async () => {
    try {
      setIsUploading(true);
      setConnectionError(null);
      
      const success = await initializeGoogleDrive();
      
      if (success) {
        setDriveConnected(true);
        setConnectionError(null);
      } else {
        setDriveConnected(false);
        setConnectionError('Google Drive integration requires proper OAuth configuration. This feature is not available in the demo environment.');
      }
    } catch (error) {
      console.error('Drive connection error:', error);
      setDriveConnected(false);
      setConnectionError('Failed to connect to Google Drive. Please check your internet connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      const reportData = {
        type: reportType,
        items,
        sales,
        generatedAt: new Date().toISOString(),
      };

      const pdfBlob = await generatePDFReport(reportData);
      
      if (autoUpload && driveConnected) {
        setIsUploading(true);
        const driveLink = await uploadToGoogleDrive(pdfBlob, reportType);
        if (driveLink) {
          setLastUpload(new Date().toISOString());
          alert(`Report generated and uploaded to Google Drive!\nLink: ${driveLink}`);
        } else {
          // Fallback to download if upload fails
          downloadPDF(pdfBlob, reportType);
          alert('Google Drive upload failed. Report has been downloaded locally instead.');
        }
        setIsUploading(false);
      } else {
        // Download locally
        downloadPDF(pdfBlob, reportType);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (blob: Blob, type: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleScheduleReports = () => {
    // This would set up automatic report generation
    alert('Automatic report scheduling will be implemented based on your preferences.');
  };

  const lowStockItems = items.filter(item => item.quantity <= item.minQuantity);
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);

  const stats = [
    {
      title: 'Total Items',
      value: items.length,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Sales',
      value: totalItemsSold,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Reports Generated',
      value: lastUpload ? '1+' : '0',
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Google Drive Connection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${driveConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Upload className={`h-5 w-5 ${driveConnected ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Google Drive Integration</h3>
              <p className="text-sm text-gray-600">
                {driveConnected ? 'Connected - Reports will be automatically uploaded' : 'Connect to automatically upload reports to Google Drive'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${driveConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-600">
              {driveConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Connection Error Message */}
        {connectionError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">Google Drive Connection Issue</h4>
                <p className="text-sm text-yellow-700">{connectionError}</p>
                <p className="text-sm text-yellow-700 mt-2">
                  <strong>Alternative:</strong> You can still generate and download reports locally to your device.
                </p>
              </div>
            </div>
          </div>
        )}

        {!driveConnected && (
          <button
            onClick={handleConnectDrive}
            disabled={isUploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="h-5 w-5" />
            {isUploading ? 'Connecting...' : 'Connect to Google Drive'}
          </button>
        )}

        {driveConnected && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">Google Drive Connected</span>
            </div>
            <p className="text-sm text-green-700">
              Reports will be automatically uploaded to your Google Drive in the "Stock Manager Reports" folder.
              {lastUpload && ` Last upload: ${new Date(lastUpload).toLocaleString()}`}
            </p>
          </div>
        )}
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-600">Create professional PDF reports for your stock data</p>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {reportTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                reportType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${type.color} p-2 rounded-lg`}>
                  <type.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Report Options</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={autoUpload}
                onChange={(e) => setAutoUpload(e.target.checked)}
                disabled={!driveConnected}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                Automatically upload to Google Drive {!driveConnected && '(requires connection)'}
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || isUploading}
            className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileText className="h-5 w-5" />
            {isGenerating ? 'Generating...' : isUploading ? 'Uploading...' : 'Generate Report'}
          </button>
          
          <button
            onClick={handleScheduleReports}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <Settings className="h-5 w-5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Report Type:</strong> {reportTypes.find(t => t.id === reportType)?.title}</p>
            <p><strong>Generated Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Total Items:</strong> {items.length}</p>
            <p><strong>Low Stock Items:</strong> {lowStockItems.length}</p>
            <p><strong>Total Sales Records:</strong> {sales.length}</p>
            <p><strong>Download Method:</strong> {driveConnected && autoUpload ? 'Google Drive Upload' : 'Local Download'}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use Reports</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Local Download:</strong> Reports are automatically downloaded to your device's Downloads folder</p>
          <p><strong>Mobile Access:</strong> Downloaded PDFs can be viewed using any PDF reader app</p>
          <p><strong>Sharing:</strong> Use your device's share function to send reports via email, messaging, or cloud storage</p>
          <p><strong>Google Drive:</strong> Requires proper OAuth setup (not available in demo environment)</p>
          <p><strong>Tip:</strong> Generate reports regularly to track your inventory trends and sales performance</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;