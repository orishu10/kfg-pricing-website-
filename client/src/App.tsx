import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
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
