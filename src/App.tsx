import { useState } from 'react';
import { StockProvider } from './context/StockContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import StockList from './components/StockList';
import SalesHistory from './components/SalesHistory';
import ImportExport from './components/ImportExport';
import Reports from './components/Reports';
import AddStockForm from './components/AddStockForm';
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockList />;
      case 'sales':
        return <SalesHistory />;
      case 'reports':
        return <Reports />;
      case 'import-export':
        return <ImportExport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <StockProvider>
      <div className="min-h-screen bg-gray-50">
        <OfflineIndicator />
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddClick={() => setIsAddFormOpen(true)}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div key={activeTab} className="animate-fade-in-up">
            {renderContent()}
          </div>
        </main>

        <AddStockForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
        />
      </div>
    </StockProvider>
  );
}

export default App;