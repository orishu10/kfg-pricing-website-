import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem, deleteItem, Item } from '../api';

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getItem(itemId!).then(data => {
      setItem(data);
      setName(data.name);
      setFinalPrice(data.final_price ?? '');
    }).catch(() => navigate('/'));
  }, [itemId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const updated = await updateItem(itemId!, {
        name: name.trim(),
        final_price: finalPrice !== '' ? parseFloat(finalPrice) : null,
      });
      setItem(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save changes');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete item "${item?.name}"?`)) return;
    try {
      await deleteItem(itemId!);
      navigate(`/customers/${item?.customer_id}/suppliers/${item?.supplier_id}/items`);
    } catch {
      setError('Failed to delete item');
    }
  };

  if (!item) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <button
        className="btn-back"
        onClick={() => navigate(`/customers/${item.customer_id}/suppliers/${item.supplier_id}/items`)}
      >
        ← Items
      </button>

      <div className="page-header">
        <h1>Item Detail</h1>
        <button className="btn-danger" onClick={handleDelete}>Delete Item</button>
      </div>

      <form className="card form-card item-detail-form" onSubmit={handleSave}>
        <div className="field-readonly">
          <span className="field-label">Item ID</span>
          <span className="field-value">{item.id}</span>
        </div>
        <div className="field-readonly">
          <span className="field-label">Customer ID</span>
          <span className="field-value">{item.customer_id}</span>
        </div>
        <div className="field-readonly">
          <span className="field-label">Supplier ID</span>
          <span className="field-value">#{item.supplier_id}</span>
        </div>

        <hr />

        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>

        <label>
          Final Price
          <input
            type="number"
            step="0.01"
            min="0"
            value={finalPrice}
            onChange={e => setFinalPrice(e.target.value)}
            placeholder="0.00"
          />
        </label>

        {/* Pricing fields will be added here as they are defined */}

        {error && <p className="error">{error}</p>}
        {saved && <p className="success">Saved!</p>}

        <button className="btn-primary" type="submit">Save Changes</button>
      </form>
    </div>
  );
}
