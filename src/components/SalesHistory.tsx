import React, { useState } from 'react';
import { Search, Calendar, Package, TrendingUp, DollarSign } from 'lucide-react';
import { useStock } from '../context/StockContext';

const SalesHistory: React.FC = () => {
  const { sales } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const filterSalesByPeriod = (sales: any[], period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        return sales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= monthAgo;
        });
      default:
        return sales;
    }
  };

  const filteredSales = filterSalesByPeriod(sales, selectedPeriod).filter(sale =>
    sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
  const totalTransactions = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = [
    {
      title: 'Items Sold',
      value: totalItemsSold,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Transactions',
      value: totalTransactions,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
          <p className="text-gray-600">No sales records match your current filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Brand</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Price/Unit</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{sale.itemName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{sale.brand}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {sale.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">{sale.quantitySold} units</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {sale.pricePerUnit ? `Rs. ${sale.pricePerUnit.toFixed(2)}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {sale.totalPrice ? `Rs. ${sale.totalPrice.toFixed(2)}` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(sale.saleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;