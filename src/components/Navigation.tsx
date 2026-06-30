import React from 'react';
import { Package, BarChart3, List, Plus, ShoppingCart, ArrowUpDown, FileText } from 'lucide-react';
import PWAInstallButton from './PWAInstallButton';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onAddClick }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'stock', label: 'Stock List', icon: List },
    { id: 'sales', label: 'Sales History', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'import-export', label: 'Import/Export', icon: ArrowUpDown },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600 animate-float" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                Stock Manager
              </h1>
            </div>
            
            <div className="hidden md:flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <button
              onClick={onAddClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow-md transition-all duration-200 active:scale-95 font-medium flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="flex justify-around py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;