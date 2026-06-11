import { useEffect, useState, type FormEvent } from 'react';
import { getCustomers, createCustomer, deleteCustomer, type Customer } from '../../../api';

export const useCustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setCustomers(await getCustomers());
    } catch {
      setError('Failed to load customers');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCustomer({ id: newId.trim(), name: newName.trim() });
      setNewId('');
      setNewName('');
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to create customer');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete customer "${name}"? This will also remove all their supplier links and items.`)) return;
    try {
      await deleteCustomer(id);
      load();
    } catch {
      setError('Failed to delete customer');
    }
  };

  return {
    customers,
    showForm,
    newId,
    setNewId,
    newName,
    setNewName,
    error,
    toggleForm,
    handleAdd,
    handleDelete,
  };
};
