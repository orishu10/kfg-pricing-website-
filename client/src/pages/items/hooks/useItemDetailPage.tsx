import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItem, updateItem, deleteItem, type Item, type ItemPayload } from '../../../api';
import { EMPTY_FORM } from '../utils/consts';
import { toNum, toInt, calcDerived, itemToForm } from '../utils/helpers';
import type { FormState } from '../utils/types';

const formToPayload = (form: FormState): ItemPayload => ({
  name: form.name,
  size: form.size || null,
  supplier_incoterms: form.supplier_incoterms || null,
  customer_incoterms: form.customer_incoterms || null,
  logistics: toNum(form.logistics),
  container_type: form.container_type || null,
  fob: toNum(form.fob),
  cif: toNum(form.cif),
  dap: toNum(form.dap),
  ddp: toNum(form.ddp),
  cases_in_fcl: toInt(form.cases_in_fcl),
  units_in_case: toInt(form.units_in_case),
  unit_weight: toNum(form.unit_weight),
  cases_per_pallet: toInt(form.cases_per_pallet),
  pallets_per_fcl: toInt(form.pallets_per_fcl),
  supplier_price_unit: toNum(form.supplier_price_unit),
  supplier_price_case: toNum(form.supplier_price_case),
  supplier_price_fcl: toNum(form.supplier_price_fcl),
  supplier_price_1kg: toNum(form.supplier_price_1kg),
  sub_total_1: toNum(form.sub_total_1),
  us_tariff: toNum(form.us_tariff),
  sub_total_2: toNum(form.sub_total_2),
  import_factor: toNum(form.import_factor),
  kfg_commission: toNum(form.kfg_commission),
  total: toNum(form.total),
  kfg_commission_total: toNum(form.kfg_commission_total),
  tariffs_total: toNum(form.tariffs_total),
  usd_nis: toNum(form.usd_nis),
  cost_unit: toNum(form.cost_unit),
  cost_case: toNum(form.cost_case),
  price_unit: toNum(form.price_unit),
  price_case: toNum(form.price_case),
  sap_price_unit: toNum(form.sap_price_unit),
  sap_price_case: toNum(form.sap_price_case),
});

export const useItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const itemQuery = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId!),
  });
  const item = itemQuery.data ?? null;

  // Initialize the form whenever a (re)fetched item arrives (reset during render,
  // keyed on the item's identity + last-updated signature).
  const [syncedSig, setSyncedSig] = useState<string | null>(null);
  const itemSig = item ? `${item.id}:${item.updated_at ?? item.created_at}` : null;
  if (item && itemSig !== syncedSig) {
    setSyncedSig(itemSig);
    const f = itemToForm(item);
    setForm({ ...f, ...calcDerived(f) });
  }

  useEffect(() => {
    if (itemQuery.isError) navigate('/');
  }, [itemQuery.isError, navigate]);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, ...calcDerived(next) };
    });
  };

  const saveMutation = useMutation({
    mutationFn: (payload: ItemPayload) => updateItem(itemId!, payload),
    onSuccess: (updated: Item) => {
      queryClient.setQueryData(['item', itemId], updated);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to save');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(itemId!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: () => setError('Failed to delete item'),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    saveMutation.mutate(formToPayload(form));
  };

  const handleDelete = () => setDeleteOpen(true);

  const confirmDelete = () => {
    setDeleteOpen(false);
    setError('');
    deleteMutation.mutate();
  };

  return { item, form, saved, error, deleteOpen, setDeleteOpen, set, handleSave, handleDelete, confirmDelete };
};
