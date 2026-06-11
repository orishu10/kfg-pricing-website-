import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCustomer, getCustomerSuppliers, getAllSuppliers,
  createSupplier, linkSupplierToCustomer,
  type Customer, type Supplier,
} from '../../../api';

export const useSuppliersPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState(0);
  const [newName, setNewName] = useState('');
  const [linkId, setLinkId] = useState('');
  const [error, setError] = useState('');

  const loadSuppliers = async () => {
    try {
      setSuppliers(await getCustomerSuppliers(customerId!));
    } catch {
      setError('Failed to load suppliers');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setCustomer(await getCustomer(customerId!));
      } catch {
        navigate('/customers');
        return;
      }
      loadSuppliers();
      setAllSuppliers(await getAllSuppliers());
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const toggleForm = () => {
    setShowForm((v) => !v);
    setError('');
  };

  const handleAddNew = async (e: FormEvent) => {
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

  const handleLinkExisting = async (e: FormEvent) => {
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

  const linkedIds = new Set(suppliers.map((s) => s.id));
  const unlinkableSuppliers = allSuppliers.filter((s) => !linkedIds.has(s.id));

  return {
    customerId,
    customer,
    suppliers,
    unlinkableSuppliers,
    showForm,
    tab,
    setTab,
    newName,
    setNewName,
    linkId,
    setLinkId,
    error,
    toggleForm,
    handleAddNew,
    handleLinkExisting,
  };
};
