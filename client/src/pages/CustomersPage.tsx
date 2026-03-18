import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers, createCustomer, deleteCustomer, Customer } from '../api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => getCustomers().then(setCustomers).catch(() => setError('Failed to load customers'));

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCustomer({ id: newId.trim(), name: newName.trim() });
      setNewId('');
      setNewName('');
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create customer');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This will also remove all their supplier links and items.`)) return;
    try {
      await deleteCustomer(id);
      load();
    } catch {
      setError('Failed to delete customer');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn-primary" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleAdd}>
          <h2>New Customer</h2>
          <label>
            Customer ID (unique, you define it)
            <input
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="e.g. CUST-001"
              required
            />
          </label>
          <label>
            Name
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Customer name"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" type="submit">Create</button>
        </form>
      )}

      {!showForm && error && <p className="error">{error}</p>}

      <div className="list">
        {customers.length === 0 && <p className="empty">No customers yet.</p>}
        {customers.map(c => (
          <div key={c.id} className="list-item" onClick={() => navigate(`/customers/${c.id}/suppliers`)}>
            <div className="list-item-content">
              <span className="list-item-name">{c.name}</span>
              <span className="list-item-id">{c.id}</span>
            </div>
            <button
              className="btn-danger btn-small"
              onClick={e => { e.stopPropagation(); handleDelete(c.id, c.name); }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
