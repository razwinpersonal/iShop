import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockItem, StockFormData, SaleRecord } from '../types/stock';
import { exportToExcel, getExportSettings, ExportData } from '../utils/exportUtils';

interface StockContextType {
  items: StockItem[];
  sales: SaleRecord[];
  addItem: (item: StockFormData) => void;
  updateItem: (id: string, item: StockFormData) => void;
  deleteItem: (id: string) => void;
  adjustQuantity: (id: string, adjustment: number) => void;
  recordSale: (itemId: string, quantitySold: number, pricePerUnit?: number) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

interface StockProviderProps {
  children: ReactNode;
}

// Initial phone models data
const initialPhoneModels = [
  // iPhone Models
  { name: '6G', category: 'iPhone', brand: 'Apple' },
  { name: '6s', category: 'iPhone', brand: 'Apple' },
  { name: '7 PLUS', category: 'iPhone', brand: 'Apple' },
  { name: '7G', category: 'iPhone', brand: 'Apple' },
  { name: '8G', category: 'iPhone', brand: 'Apple' },
  { name: 'X', category: 'iPhone', brand: 'Apple' },
  { name: '11', category: 'iPhone', brand: 'Apple' },
  
  // Huawei Models
  { name: 'Nova 3i', category: 'Huawei', brand: 'Huawei' },
  { name: 'Nova 7i', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y5 (2019)', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y5 2018', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y6 (2019)', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y6 2019', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y6p 2020', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y7 (2019)', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y7p 2020', category: 'Huawei', brand: 'Huawei' },
  { name: 'Y9 (2018)', category: 'Huawei', brand: 'Huawei' },
  
  // Infinix Models
  { name: 'X8A', category: 'Infinix', brand: 'Infinix' },
  { name: 'HOT 10 PLAY', category: 'Infinix', brand: 'Infinix' },
  
  // Nokia Models
  { name: '1.4', category: 'Nokia', brand: 'Nokia' },
  { name: 'C2', category: 'Nokia', brand: 'Nokia' },
  { name: 'C10', category: 'Nokia', brand: 'Nokia' },
  
  // Oppo Models
  { name: 'A1K', category: 'Oppo', brand: 'Oppo' },
  { name: 'A12', category: 'Oppo', brand: 'Oppo' },
  { name: 'A15 (c21y)', category: 'Oppo', brand: 'Oppo' },
  { name: 'A3S', category: 'Oppo', brand: 'Oppo' },
  { name: 'A5 (2020)', category: 'Oppo', brand: 'Oppo' },
  { name: 'A54', category: 'Oppo', brand: 'Oppo' },
  
  // Redmi Models
  { name: 'M3/ REDMI 9T', category: 'Redmi', brand: 'Xiaomi' },
  { name: 'C11 (2021)', category: 'Redmi', brand: 'Xiaomi' },
  { name: '8', category: 'Redmi', brand: 'Xiaomi' },
  { name: '9A', category: 'Redmi', brand: 'Xiaomi' },
  { name: '10', category: 'Redmi', brand: 'Xiaomi' },
  { name: '12', category: 'Redmi', brand: 'Xiaomi' },
  
  // Realme Models
  { name: 'A1', category: 'Realme', brand: 'Realme' },
  
  // Samsung Models
  { name: 'Note 8', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'Note 9', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'Note 10', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A01', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A01 CORE', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A03 core', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A04', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A04E', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A04S', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A05', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A05s', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A10', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A10s', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A11', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A20s', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A21s', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A2 Core', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'J2 core', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'J4 Plus', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'M02', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'M02S/ A03s', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A51', category: 'Samsung Galaxy', brand: 'Samsung' },
  { name: 'A54', category: 'Samsung Galaxy', brand: 'Samsung' },
  
  // Tecno Models
  { name: 'POP 7', category: 'Tecno', brand: 'Tecno' },
  { name: 'Spark 6 Go', category: 'Tecno', brand: 'Tecno' },
  { name: 'Spark 8C', category: 'Tecno', brand: 'Tecno' },
  
  // Vivo Models
  { name: 'Y1S/VIVO93', category: 'Vivo', brand: 'Vivo' },
  { name: 'Y12', category: 'Vivo', brand: 'Vivo' },
  { name: 'Y20', category: 'Vivo', brand: 'Vivo' },
  { name: 'Y85', category: 'Vivo', brand: 'Vivo' },
];

// Auto-export function
const triggerAutoExport = async (items: StockItem[], sales: SaleRecord[]) => {
  const settings = getExportSettings();
  if (settings.autoExport && settings.defaultDirectory) {
    try {
      const exportData: ExportData = {
        items,
        sales,
        exportDate: new Date().toISOString()
      };
      
      const result = await exportToExcel(exportData, `auto-backup-${new Date().toISOString().split('T')[0]}.xlsx`, true);
      console.log('Auto-export completed:', result);
      
      // Show a subtle notification
      if (result.includes('Auto-saved')) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
        notification.textContent = 'Auto-backup saved successfully';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } catch (error) {
      console.error('Auto-export failed:', error);
    }
  }
};

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('stockItems');
    const savedSales = localStorage.getItem('salesRecords');
    
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setItems(parsedItems);
    } else {
      // If no saved items, initialize with phone models
      const phoneStockItems: StockItem[] = initialPhoneModels.map((phone, index) => ({
        id: `phone-${index + 1}`,
        name: phone.name,
        brand: phone.brand,
        category: phone.category,
        quantity: 0,
        minQuantity: 2,
        description: `${phone.brand} ${phone.name} mobile phone`,
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      }));
      setItems(phoneStockItems);
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  // Save to localStorage whenever items or sales change
  useEffect(() => {
    localStorage.setItem('stockItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('salesRecords', JSON.stringify(sales));
  }, [sales]);

  // Auto-export trigger when items or sales change (with debounce)
  useEffect(() => {
    if (items.length > 0) { // Only trigger if we have data
      const timeoutId = setTimeout(() => {
        triggerAutoExport(items, sales);
      }, 2000); // 2 second delay to avoid too frequent exports

      return () => clearTimeout(timeoutId);
    }
  }, [items, sales]);

  const addItem = (item: StockFormData) => {
    const newItem: StockItem = {
      id: Date.now().toString(),
      ...item,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, item: StockFormData) => {
    setItems(prev => prev.map(stockItem => 
      stockItem.id === id 
        ? { ...stockItem, ...item, lastUpdated: new Date().toISOString() }
        : stockItem
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const adjustQuantity = (id: string, adjustment: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            quantity: Math.max(0, item.quantity + adjustment),
            lastUpdated: new Date().toISOString()
          }
        : item
    ));
  };

  const recordSale = (itemId: string, quantitySold: number, pricePerUnit: number = 0) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.quantity < quantitySold) return;

    // Create sale record with proper price information
    const saleRecord: SaleRecord = {
      id: Date.now().toString(),
      itemId,
      itemName: item.name,
      brand: item.brand,
      category: item.category,
      quantitySold,
      pricePerUnit: pricePerUnit > 0 ? pricePerUnit : undefined,
      totalPrice: pricePerUnit > 0 ? quantitySold * pricePerUnit : undefined,
      saleDate: new Date().toISOString(),
    };

    // Add to sales records
    setSales(prev => [saleRecord, ...prev]);

    // Reduce quantity from stock
    adjustQuantity(itemId, -quantitySold);
  };

  const exportData = () => {
    const exportData = {
      items,
      sales,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate data structure
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid data format: items array not found');
      }

      // Validate each item has required fields
      const requiredFields = ['id', 'name', 'brand', 'category', 'quantity', 'minQuantity'];
      for (const item of data.items) {
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Invalid data format: missing field ${field}`);
          }
        }
      }

      setItems(data.items);
      if (data.sales && Array.isArray(data.sales)) {
        setSales(data.sales);
      }
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  };

  return (
    <StockContext.Provider value={{
      items,
      sales,
      addItem,
      updateItem,
      deleteItem,
      adjustQuantity,
      recordSale,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      exportData,
      importData,
    }}>
      {children}
    </StockContext.Provider>
  );
};