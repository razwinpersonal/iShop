export interface StockItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  minQuantity: number;
  description: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface StockFormData {
  name: string;
  brand: string;
  category: string;
  quantity: number;
  minQuantity: number;
  description: string;
}

export interface SaleRecord {
  id: string;
  itemId: string;
  itemName: string;
  brand: string;
  category: string;
  quantitySold: number;
  pricePerUnit?: number;
  totalPrice?: number;
  saleDate: string;
}