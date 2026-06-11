import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getItem, updateItem, deleteItem, type Item, type ItemPayload } from '../../../api';
import { EMPTY_FORM } from '../utils/consts';
import { toNum, toInt, calcDerived, itemToForm } from '../utils/helpers';
import type { FormState } from '../utils/types';

export const useItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getItem(itemId!);
        setItem(data);
        const f = itemToForm(data);
        setForm({ ...f, ...calcDerived(f) });
      } catch {
        navigate('/');
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, ...calcDerived(next) };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    const payload: ItemPayload = {
      name: form.name,
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
    };
    try {
      const updated = await updateItem(itemId!, payload);
      setItem(updated);
      const f = itemToForm(updated);
      setForm({ ...f, ...calcDerived(f) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
      setError(msg || 'Failed to save');
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

  return { item, form, saved, error, set, handleSave, handleDelete };
};
