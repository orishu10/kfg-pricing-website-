import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCustomer, getCustomerSuppliers, getSupplierItems,
  createItem, type Item, type Customer, type Supplier
} from '../api';

export default function ItemsPage() {
  const { customerId, supplierId } = useParams<{ customerId: string; supplierId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const loadItems = () =>
    getSupplierItems(Number(supplierId), customerId!).then(setItems).catch(() => setError('Failed to load items'));

  useEffect(() => {
    getCustomer(customerId!).then(setCustomer).catch(() => navigate('/'));
    getCustomerSuppliers(customerId!).then(list => {
      const found = list.find(s => s.id === Number(supplierId));
      if (!found) navigate(`/customers/${customerId}/suppliers`);
      else setSupplier(found);
    });
    loadItems();
    // navigate and loadItems are stable references — intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, supplierId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createItem({
        id: newId.trim(),
        name: newName.trim(),
        customer_id: customerId!,
        supplier_id: Number(supplierId),
      });
      setNewId('');
      setNewName('');
      setShowForm(false);
      loadItems();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create item');
    }
  };

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate(`/customers/${customerId}/suppliers`)}>
        ← {customer?.name ?? '...'}
      </button>

      <div className="page-header">
        <h1>{supplier?.name ?? '...'} — Items</h1>
        <button className="btn-primary" onClick={() => { setShowForm(v => !v); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleAdd}>
          <h2>New Item</h2>
          <label>
            Item ID (unique, you define it)
            <input value={newId} onChange={e => setNewId(e.target.value)} placeholder="e.g. ITEM-001" required />
          </label>
          <label>
            Name
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Item name" required />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" type="submit">Create</button>
        </form>
      )}

      {!showForm && error && <p className="error">{error}</p>}

      <div className="list">
        {items.length === 0 && <p className="empty">No items for this supplier / customer yet.</p>}
        {items.map(item => (
          <div
            key={item.id}
            className="list-item"
            onClick={() => navigate(`/items/${item.id}`)}
          >
            <div className="list-item-content">
              <span className="list-item-name">{item.name}</span>
              <span className="list-item-id">{item.id}</span>
            </div>
            <span className="list-item-price">
              {item.total != null ? `$${parseFloat(item.total).toFixed(2)}` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
