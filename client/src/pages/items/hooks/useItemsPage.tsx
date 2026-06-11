import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCustomer, getCustomerSuppliers, getSupplierItems,
  createItem, type Item, type Customer, type Supplier,
} from '../../../api';

export const useItemsPage = () => {
  const { customerId, supplierId } = useParams<{ customerId: string; supplierId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      setItems(await getSupplierItems(Number(supplierId), customerId!));
    } catch {
      setError('Failed to load items');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [cust, suppliers] = await Promise.all([
          getCustomer(customerId!),
          getCustomerSuppliers(customerId!),
        ]);
        setCustomer(cust);
        const found = suppliers.find((s) => s.id === Number(supplierId));
        if (!found) navigate(`/customers/${customerId}/suppliers`);
        else setSupplier(found);
      } catch {
        navigate('/customers');
      }
    };
    init();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, supplierId]);

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAdd = async (e: FormEvent) => {
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

  return {
    customerId,
    customer,
    supplier,
    items,
    showForm,
    newId,
    setNewId,
    newName,
    setNewName,
    error,
    toggleForm,
    handleAdd,
  };
};
