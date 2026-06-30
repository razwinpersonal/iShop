import * as XLSX from 'xlsx';
import { StockItem, SaleRecord } from '../types/stock';

export interface ExportData {
  items: StockItem[];
  sales: SaleRecord[];
  exportDate: string;
}

// Auto-export settings
interface ExportSettings {
  defaultDirectory: string;
  autoExport: boolean;
  lastExportPath: string;
  directoryHandle?: any;
}

// Get export settings from localStorage
export const getExportSettings = (): ExportSettings => {
  const saved = localStorage.getItem('exportSettings');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    defaultDirectory: '',
    autoExport: false,
    lastExportPath: ''
  };
};

// Save export settings to localStorage
const saveExportSettings = (settings: ExportSettings) => {
  localStorage.setItem('exportSettings', JSON.stringify(settings));
};

// Check if File System Access API is supported
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window;
};

// Show directory picker and save as default
export const selectDefaultDirectory = async (): Promise<string | null> => {
  if (!isFileSystemAccessSupported()) {
    alert('Directory selection is not supported in this browser. Files will be downloaded to your default Downloads folder.');
    return null;
  }

  try {
    // @ts-ignore - File System Access API
    const directoryHandle = await window.showDirectoryPicker();
    const settings = getExportSettings();
    settings.defaultDirectory = directoryHandle.name;
    settings.autoExport = true;
    settings.directoryHandle = directoryHandle;
    saveExportSettings(settings);
    
    return directoryHandle.name;
  } catch (error) {
    console.error('Directory selection cancelled or failed:', error);
    return null;
  }
};

// Auto-save file to default directory
const autoSaveToDirectory = async (blob: Blob, filename: string): Promise<boolean> => {
  if (!isFileSystemAccessSupported()) {
    return false;
  }

  try {
    const settings = getExportSettings();
    if (!settings.directoryHandle) {
      return false;
    }

    // Create file in the selected directory
    const fileHandle = await settings.directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();

    settings.lastExportPath = `${settings.defaultDirectory}/${filename}`;
    saveExportSettings(settings);

    return true;
  } catch (error) {
    console.error('Auto-save failed:', error);
    // If auto-save fails, fall back to regular download
    return false;
  }
};

// Fallback download method
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export to Excel (.xlsx) with auto-save option
export const exportToExcel = async (data: ExportData, filename?: string, autoSave: boolean = true): Promise<string> => {
  const workbook = XLSX.utils.book_new();
  
  // Create Stock Items worksheet
  const stockData = data.items.map(item => ({
    'Product Name': item.name,
    'Brand': item.brand,
    'Category': item.category,
    'Current Quantity': item.quantity,
    'Minimum Quantity': item.minQuantity,
    'Description': item.description,
    'Status': item.quantity === 0 ? 'Out of Stock' : 
              item.quantity < item.minQuantity ? 'Low Stock' : 'In Stock',
    'Date Added': new Date(item.dateAdded).toLocaleDateString(),
    'Last Updated': new Date(item.lastUpdated).toLocaleDateString()
  }));
  
  const stockWorksheet = XLSX.utils.json_to_sheet(stockData);
  
  // Set column widths for better readability
  stockWorksheet['!cols'] = [
    { width: 25 }, // Product Name
    { width: 15 }, // Brand
    { width: 15 }, // Category
    { width: 12 }, // Current Quantity
    { width: 12 }, // Minimum Quantity
    { width: 30 }, // Description
    { width: 12 }, // Status
    { width: 12 }, // Date Added
    { width: 12 }  // Last Updated
  ];
  
  XLSX.utils.book_append_sheet(workbook, stockWorksheet, 'Stock Items');
  
  // Create Sales History worksheet
  const salesData = data.sales.map(sale => ({
    'Product Name': sale.itemName,
    'Brand': sale.brand,
    'Category': sale.category,
    'Quantity Sold': sale.quantitySold,
    'Price Per Unit': sale.pricePerUnit ? `Rs. ${sale.pricePerUnit.toFixed(2)}` : 'N/A',
    'Total Amount': sale.totalPrice ? `Rs. ${sale.totalPrice.toFixed(2)}` : 'N/A',
    'Sale Date': new Date(sale.saleDate).toLocaleDateString(),
    'Sale Time': new Date(sale.saleDate).toLocaleTimeString()
  }));
  
  const salesWorksheet = XLSX.utils.json_to_sheet(salesData);
  
  // Set column widths for sales worksheet
  salesWorksheet['!cols'] = [
    { width: 25 }, // Product Name
    { width: 15 }, // Brand
    { width: 15 }, // Category
    { width: 12 }, // Quantity Sold
    { width: 15 }, // Price Per Unit
    { width: 15 }, // Total Amount
    { width: 12 }, // Sale Date
    { width: 12 }  // Sale Time
  ];
  
  XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales History');
  
  // Create Summary worksheet
  const totalItems = data.items.length;
  const lowStockItems = data.items.filter(item => item.quantity < item.minQuantity).length;
  const outOfStockItems = data.items.filter(item => item.quantity === 0).length;
  const totalSales = data.sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalRevenue = data.sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const categories = [...new Set(data.items.map(item => item.category))].length;
  
  const summaryData = [
    { 'Metric': 'Total Items', 'Value': totalItems },
    { 'Metric': 'Low Stock Items', 'Value': lowStockItems },
    { 'Metric': 'Out of Stock Items', 'Value': outOfStockItems },
    { 'Metric': 'Total Categories', 'Value': categories },
    { 'Metric': 'Total Sales (Units)', 'Value': totalSales },
    { 'Metric': 'Total Revenue', 'Value': totalRevenue > 0 ? `Rs. ${totalRevenue.toFixed(2)}` : 'N/A' },
    { 'Metric': 'Export Date', 'Value': new Date(data.exportDate).toLocaleString() }
  ];
  
  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [
    { width: 20 }, // Metric
    { width: 25 }  // Value
  ];
  
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  
  // Generate filename
  const defaultFilename = `stock-data-${new Date().toISOString().split('T')[0]}.xlsx`;
  const finalFilename = filename || defaultFilename;
  
  // Create blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Try auto-save first if enabled
  const settings = getExportSettings();
  if (autoSave && settings.autoExport && settings.directoryHandle) {
    const autoSaved = await autoSaveToDirectory(blob, finalFilename);
    if (autoSaved) {
      return `Auto-saved to: ${settings.defaultDirectory}/${finalFilename}`;
    }
  }
  
  // Fallback to regular download
  downloadFile(blob, finalFilename);
  return `Downloaded: ${finalFilename}`;
};

// Export to CSV (for Google Sheets compatibility)
export const exportToCSV = (data: ExportData, type: 'stock' | 'sales' | 'summary' = 'stock') => {
  let csvData: any[] = [];
  let filename = '';
  
  switch (type) {
    case 'stock':
      csvData = data.items.map(item => ({
        'Product Name': item.name,
        'Brand': item.brand,
        'Category': item.category,
        'Current Quantity': item.quantity,
        'Minimum Quantity': item.minQuantity,
        'Description': item.description,
        'Status': item.quantity === 0 ? 'Out of Stock' : 
                  item.quantity < item.minQuantity ? 'Low Stock' : 'In Stock',
        'Date Added': new Date(item.dateAdded).toLocaleDateString(),
        'Last Updated': new Date(item.lastUpdated).toLocaleDateString()
      }));
      filename = `stock-items-${new Date().toISOString().split('T')[0]}.csv`;
      break;
      
    case 'sales':
      csvData = data.sales.map(sale => ({
        'Product Name': sale.itemName,
        'Brand': sale.brand,
        'Category': sale.category,
        'Quantity Sold': sale.quantitySold,
        'Price Per Unit': sale.pricePerUnit ? sale.pricePerUnit.toFixed(2) : '',
        'Total Amount': sale.totalPrice ? sale.totalPrice.toFixed(2) : '',
        'Sale Date': new Date(sale.saleDate).toLocaleDateString(),
        'Sale Time': new Date(sale.saleDate).toLocaleTimeString()
      }));
      filename = `sales-history-${new Date().toISOString().split('T')[0]}.csv`;
      break;
      
    case 'summary':
      const totalItems = data.items.length;
      const lowStockItems = data.items.filter(item => item.quantity < item.minQuantity).length;
      const outOfStockItems = data.items.filter(item => item.quantity === 0).length;
      const totalSales = data.sales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const totalRevenue = data.sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const categories = [...new Set(data.items.map(item => item.category))].length;
      
      csvData = [
        { 'Metric': 'Total Items', 'Value': totalItems },
        { 'Metric': 'Low Stock Items', 'Value': lowStockItems },
        { 'Metric': 'Out of Stock Items', 'Value': outOfStockItems },
        { 'Metric': 'Total Categories', 'Value': categories },
        { 'Metric': 'Total Sales (Units)', 'Value': totalSales },
        { 'Metric': 'Total Revenue (LKR)', 'Value': totalRevenue.toFixed(2) },
        { 'Metric': 'Export Date', 'Value': new Date(data.exportDate).toLocaleString() }
      ];
      filename = `stock-summary-${new Date().toISOString().split('T')[0]}.csv`;
      break;
  }
  
  // Convert to CSV
  const worksheet = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  // Create and download the file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
  
  return filename;
};

// Export filtered data
export const exportFilteredData = async (
  items: StockItem[], 
  sales: SaleRecord[], 
  format: 'excel' | 'csv' = 'excel'
): Promise<string> => {
  const exportData: ExportData = {
    items,
    sales,
    exportDate: new Date().toISOString()
  };
  
  if (format === 'excel') {
    return await exportToExcel(exportData, `filtered-stock-data-${new Date().toISOString().split('T')[0]}.xlsx`);
  } else {
    return exportToCSV(exportData, 'stock');
  }
};

// Reset export settings
export const resetExportSettings = () => {
  localStorage.removeItem('exportSettings');
};

// Generate Google Sheets compatible URL (for manual import)
export const generateGoogleSheetsImportURL = (csvData: string) => {
  const encodedData = encodeURIComponent(csvData);
  return `https://docs.google.com/spreadsheets/create?usp=sharing&data=${encodedData}`;
};