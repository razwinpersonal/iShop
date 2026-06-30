import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { StockFormData } from '../types/stock';

interface AddStockFormProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: any;
}

const AddStockForm: React.FC<AddStockFormProps> = ({ isOpen, onClose, editItem }) => {
  const { addItem, updateItem } = useStock();
  const [formData, setFormData] = useState<StockFormData>({
    name: '',
    brand: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    description: '',
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        brand: editItem.brand || '',
        category: editItem.category || '',
        quantity: editItem.quantity || 0,
        minQuantity: editItem.minQuantity || 0,
        description: editItem.description || '',
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        quantity: 0,
        minQuantity: 0,
        description: '',
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateItem(editItem.id, formData);
    } else {
      addItem(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'minQuantity' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editItem ? 'Edit Stock Item' : 'Add New Stock Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-90"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter brand name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter category"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Quantity
              </label>
              <input
                type="number"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter product description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              {editItem ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 active:scale-95 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockForm;