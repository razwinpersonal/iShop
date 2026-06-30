import React, { useState } from 'react';
import { TrendingDown, Package, AlertTriangle, Search, X, Filter, Download, FileSpreadsheet } from 'lucide-react';
import { useStock } from '../context/StockContext';
import { exportFilteredData } from '../utils/exportUtils';

const Dashboard: React.FC = () => {
  const { items, sales } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.quantity < item.minQuantity); // Changed from <= to <
  const categories = [...new Set(items.map(item => item.category))].length;

  // Get unique categories and brands for filter dropdowns
  const allCategories = ['All', ...new Set(items.map(item => item.category))];
  const allBrands = ['All', ...new Set(items.map(item => item.brand))];

  // Filter items based on all criteria
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || item.brand === selectedBrand;
    
    let matchesStockFilter = true;
    if (stockFilter === 'Low Stock') {
      matchesStockFilter = item.quantity < item.minQuantity; // Changed from <= to <
    } else if (stockFilter === 'In Stock') {
      matchesStockFilter = item.quantity > item.minQuantity;
    } else if (stockFilter === 'Out of Stock') {
      matchesStockFilter = item.quantity === 0;
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesStockFilter;
  });

  const filteredSales = sales.filter(sale =>
    sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = () => {
    console.log('Dashboard search:', searchTerm);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setStockFilter('All');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedBrand !== 'All' || stockFilter !== 'All';

  // Calculate filtered statistics
  const filteredLowStock = filteredItems.filter(item => item.quantity < item.minQuantity); // Changed from <= to <
  const filteredCategories = [...new Set(filteredItems.map(item => item.category))].length;

  // Export filtered data with auto-save
  const handleExportFiltered = async (format: 'excel' | 'csv') => {
    try {
      const result = await exportFilteredData(filteredItems, filteredSales, format);
      alert(`Export completed: ${result}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export filtered data. Please try again.');
    }
  };

  const stats = [
    {
      title: 'Total Items',
      value: hasActiveFilters ? filteredItems.length : totalItems,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Low Stock',
      value: hasActiveFilters ? filteredLowStock.length : lowStockItems.length,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Categories',
      value: hasActiveFilters ? filteredCategories : categories,
      icon: TrendingDown,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Dashboard Filters
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <>
                <button
                  onClick={() => handleExportFiltered('excel')}
                  className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Auto-Export Excel
                </button>
                <button
                  onClick={() => handleExportFiltered('csv')}
                  className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative flex mb-4">
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
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 border border-blue-600"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {allBrands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-green-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedBrand !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                Brand: {selectedBrand}
                <button onClick={() => setSelectedBrand('All')} className="hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {stockFilter !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                Stock: {stockFilter}
                <button onClick={() => setStockFilter('All')} className="hover:text-orange-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Export Notice for Filtered Data */}
        {hasActiveFilters && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Filtered View Active:</strong> Export buttons above will save filtered data ({filteredItems.length} items, {filteredSales.length} sales).
              {/* Show auto-export status if Excel is selected */}
              <br />
              <span className="text-xs">Excel exports will use your auto-save settings if configured.</span>
            </p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
                {hasActiveFilters && (
                  <p className="text-xs text-gray-500 mt-1">Filtered results</p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {(hasActiveFilters ? filteredLowStock : lowStockItems).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 animate-fade-in-up">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 animate-pulse" />
            <h3 className="text-lg font-semibold text-orange-800">
              Low Stock Alert {hasActiveFilters && `(Filtered)`}
            </h3>
          </div>
          <div className="space-y-2">
            {(hasActiveFilters ? filteredLowStock : lowStockItems).map((item) => (
              <div key={item.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                item.quantity === 0 ? 'bg-red-100 border-red-200' : 'bg-white border-orange-200'
              }`}>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category} • {item.brand}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.quantity === 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {item.quantity} remaining
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {item.minQuantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales */}
      {(hasActiveFilters ? filteredSales : sales).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Sales {hasActiveFilters && `(Filtered)`}
          </h3>
          <div className="space-y-3">
            {(hasActiveFilters ? filteredSales : sales).slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{sale.itemName}</p>
                  <p className="text-sm text-gray-600">
                    {sale.quantitySold} units • {new Date(sale.saleDate).toLocaleDateString()} • {sale.brand}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{sale.quantitySold} sold</p>
                  {sale.totalPrice && (
                    <p className="text-xs text-gray-500">Rs. {sale.totalPrice.toFixed(2)}</p>
                  )}
                  <p className="text-xs text-gray-500">{sale.category}</p>
                </div>
              </div>
            ))}
          </div>
          {hasActiveFilters && filteredSales.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No sales found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* No Results Message */}
      {hasActiveFilters && filteredItems.length === 0 && filteredSales.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600 mb-4">
            No items or sales records match your current filters
          </p>
          <button
            onClick={clearAllFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;