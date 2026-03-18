import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCustomer, getCustomerSuppliers, getAllSuppliers,
  createSupplier, linkSupplierToCustomer,
  type Customer, type Supplier
} from '../api';

export default function SuppliersPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [newName, setNewName] = useState('');
  const [linkId, setLinkId] = useState('');
  const [error, setError] = useState('');

  const loadSuppliers = () =>
    getCustomerSuppliers(customerId!).then(setSuppliers).catch(() => setError('Failed to load suppliers'));

  useEffect(() => {
    getCustomer(customerId!).then(setCustomer).catch(() => navigate('/'));
    loadSuppliers();
    getAllSuppliers().then(setAllSuppliers);
    // navigate and loadSuppliers are stable references — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createSupplier({ name: newName.trim(), customer_id: customerId });
      setNewName('');
      setShowForm(false);
      loadSuppliers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create supplier');
    }
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await linkSupplierToCustomer(Number(linkId), customerId!);
      setLinkId('');
      setShowForm(false);
      loadSuppliers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to link supplier');
    }
  };

  const linkedIds = new Set(suppliers.map(s => s.id));
  const unlinkableSuppliers = allSuppliers.filter(s => !linkedIds.has(s.id));

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate('/')}>← Customers</button>

      <div className="page-header">
        <h1>{customer?.name ?? '...'} — Suppliers</h1>
        <button className="btn-primary" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <div className="tab-bar">
            <button className={mode === 'new' ? 'tab active' : 'tab'} onClick={() => setMode('new')}>New Supplier</button>
            <button className={mode === 'existing' ? 'tab active' : 'tab'} onClick={() => setMode('existing')}>Link Existing</button>
          </div>

          {mode === 'new' && (
            <form onSubmit={handleAddNew}>
              <label>
                Supplier Name
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Supplier name" required />
              </label>
              {error && <p className="error">{error}</p>}
              <button className="btn-primary" type="submit">Create & Link</button>
            </form>
          )}

          {mode === 'existing' && (
            <form onSubmit={handleLinkExisting}>
              <label>
                Select Supplier
                <select value={linkId} onChange={e => setLinkId(e.target.value)} required>
                  <option value="">-- choose --</option>
                  {unlinkableSuppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                  ))}
                </select>
              </label>
              {error && <p className="error">{error}</p>}
              <button className="btn-primary" type="submit" disabled={!linkId}>Link</button>
            </form>
          )}
        </div>
      )}

      {!showForm && error && <p className="error">{error}</p>}

      <div className="list">
        {suppliers.length === 0 && <p className="empty">No suppliers linked to this customer yet.</p>}
        {suppliers.map(s => (
          <div
            key={s.id}
            className="list-item"
            onClick={() => navigate(`/customers/${customerId}/suppliers/${s.id}/items`)}
          >
            <div className="list-item-content">
              <span className="list-item-name">{s.name}</span>
              <span className="list-item-id">#{s.id}</span>
            </div>
            <span className="list-item-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
