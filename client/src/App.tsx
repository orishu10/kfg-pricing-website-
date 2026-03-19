import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomersPage from './pages/customers/CustomersPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import ItemsPage from './pages/items/ItemsPage';
import ItemDetailPage from './pages/items/ItemDetailPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <a href="/" className="app-logo">KFG Pricing</a>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<CustomersPage />} />
            <Route path="/customers/:customerId/suppliers" element={<SuppliersPage />} />
            <Route path="/customers/:customerId/suppliers/:supplierId/items" element={<ItemsPage />} />
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
