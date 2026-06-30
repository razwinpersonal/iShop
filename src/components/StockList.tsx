import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Package, Plus, Minus, ShoppingCart, Download, FileSpreadsheet } from 'lucide-react';
import { useStock } from '../context/StockContext';
import AddStockForm from './AddStockForm';
import SellModal from './SellModal';
import { exportFilteredData } from '../utils/exportUtils';

const StockList: React.FC = () => {
  const { items, deleteItem, adjustQuantity, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useStock();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellItem, setSellItem] = useState(null);

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (item: any) => {
    setEditItem(item);
    setIsEditFormOpen(true);
  };

  const handleSell = (item: any) => {
    setSellItem(item);
    setIsSellModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  const getStockStatus = (quantity: number, minQuantity: number) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (quantity <= minQuantity) {
      return { label: 'Low Stock', color: 'bg-red-100 text-red-800' };
    } else if (quantity <= minQuantity * 2) {
      return { label: 'Medium Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleExportFiltered = async (format: 'excel' | 'csv') => {
    try {
      const result = await exportFilteredData(filteredItems, [], format);
      alert(`Export completed: ${result}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export filtered data. Please try again.');
    }
  };

  const hasFilters = searchTerm || selectedCategory !== 'All';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 border border-blue-600"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="ml-2 bg-gray-100 text-gray-600 px-3 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Export buttons for filtered data */}
        {hasFilters && filteredItems.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExportFiltered('excel')}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Auto-Export Excel
            </button>
            <button
              onClick={() => handleExportFiltered('csv')}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        )}
      </div>

      {/* Filter status */}
      {hasFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Showing {filteredItems.length} of {items.length} items
            {hasFilters && ' (filtered)'}
            <br />
            <span className="text-xs">Excel exports will use your auto-save settings if configured.</span>
          </p>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-float" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const status = getStockStatus(item.quantity, item.minQuantity);
            const isUrgent = status.label === 'Out of Stock' || status.label === 'Low Stock';
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${isUrgent ? 'animate-pulse' : ''}`}>
                    {status.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(item.id, -1)}
                        disabled={item.quantity <= 0}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all duration-150 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium min-w-[3rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => adjustQuantity(item.id, 1)}
                        className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-all duration-150 active:scale-90"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min Quantity:</span>
                    <span className="text-sm font-medium">{item.minQuantity}</span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleSell(item)}
                    disabled={item.quantity <= 0}
                    className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Sell
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddStockForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />

      <SellModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSellItem(null);
        }}
        item={sellItem}
      />
    </div>
  );
};

export default StockList;