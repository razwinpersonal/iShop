import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, DollarSign } from 'lucide-react';
import { useStock } from '../context/StockContext';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, item }) => {
  const { recordSale } = useStock();
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || quantity <= 0 || quantity > item.quantity || pricePerUnit <= 0) {
      return;
    }

    recordSale(item.id, quantity, pricePerUnit);
    onClose();
    setQuantity(1);
    setPricePerUnit(0);
  };

  const adjustQuantity = (adjustment: number) => {
    const newQuantity = quantity + adjustment;
    if (newQuantity >= 1 && newQuantity <= (item?.quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const totalPrice = quantity * pricePerUnit;

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Record Sale
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-90"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Item Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Brand:</span> {item.brand}</p>
              <p><span className="font-medium">Category:</span> {item.category}</p>
              <p><span className="font-medium">Available Stock:</span> {item.quantity} units</p>
            </div>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quantity to Sell
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-all duration-150 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{quantity}</div>
                <div className="text-sm text-gray-500">units</div>
              </div>
              
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                disabled={quantity >= item.quantity}
                className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-all duration-150 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {/* Quantity Input */}
            <div className="mt-4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (value >= 1 && value <= item.quantity) {
                    setQuantity(value);
                  }
                }}
                min="1"
                max={item.quantity}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center"
              />
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Unit (LKR)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Total Price Display */}
          {pricePerUnit > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Total Sale Amount:</span>
                <span className="text-xl font-bold text-blue-900">Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Remaining Stock:</span>
              <span className="font-semibold text-gray-900">{item.quantity - quantity} units</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={quantity <= 0 || quantity > item.quantity || pricePerUnit <= 0}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 hover:shadow-md transition-all duration-200 active:scale-95 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              Record Sale
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

export default SellModal;