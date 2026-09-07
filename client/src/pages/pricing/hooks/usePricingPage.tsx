import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components';
import { getPricings, deletePricing, type Pricing } from '../../../api';
import { printDocuments } from '../../../utils/print';
import { buildPricingSheetHtml } from '../utils/pricingSheet';
import { pricingLabel } from '../utils/helpers';
import type { BulkField } from '../utils/consts';

interface BulkDeleteResult {
  deleted: number;
  failed: Pricing[];
}

export const usePricingPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Pricing | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<Pricing[]>([]);
  const [bulkUpdate, setBulkUpdate] = useState<{ field: BulkField; rows: Pricing[]; onDone: () => void } | null>(null);

  const { data: pricings = [], isError } = useQuery({ queryKey: ['pricing'], queryFn: getPricings });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pricing'] });

  const deleteMutation = useMutation({
    mutationFn: (pricing: Pricing) => deletePricing(pricing.id),
    onSuccess: (_, pricing) => {
      invalidate();
      showToast({ title: `Pricing ${pricingLabel(pricing)} deleted`, variant: 'info' });
    },
    onError: () => setError('Failed to delete pricing'),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (rows: Pricing[]): Promise<BulkDeleteResult> => {
      const failed: Pricing[] = [];
      for (const row of rows) {
        try {
          await deletePricing(row.id);
        } catch {
          failed.push(row);
        }
      }
      return { deleted: rows.length - failed.length, failed };
    },
    onSuccess: ({ deleted, failed }) => {
      invalidate();
      setBulkDeleteTargets([]);
      if (failed.length === 0) {
        showToast({ title: `${deleted} pricing record${deleted === 1 ? '' : 's'} deleted`, variant: 'info' });
        return;
      }
      const shown = failed.slice(0, 5).map(pricingLabel).join(', ');
      setError(`Deleted ${deleted}. Failed ${failed.length}: ${shown}${failed.length > 5 ? '…' : ''}`);
      showToast({ title: `${failed.length} record${failed.length === 1 ? '' : 's'} could not be deleted`, variant: 'error' });
    },
    onError: () => {
      setBulkDeleteTargets([]);
      setError('Failed to delete pricing records');
    },
  });

  const handleDelete = (pricing: Pricing) => setDeleteTarget(pricing);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
  };

  const handleDeleteMany = (rows: Pricing[]) => setBulkDeleteTargets(rows);

  const confirmBulkDelete = () => {
    if (bulkDeleteTargets.length === 0) return;
    setError('');
    bulkDeleteMutation.mutate(bulkDeleteTargets);
  };

  const openBulkUpdate = (field: BulkField, rows: Pricing[], onDone: () => void = () => {}) =>
    setBulkUpdate({ field, rows, onDone });

  const closeBulkUpdate = () => setBulkUpdate(null);

  const saveAsPdf = (rows: Pricing[]) => printDocuments(rows.map(buildPricingSheetHtml));

  const q = search.toLowerCase();
  const filtered = pricings.filter(
    (p) =>
      (p.kfg_sku ?? '').toLowerCase().includes(q) ||
      (p.customer_name ?? '').toLowerCase().includes(q) ||
      (p.supplier_name ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
  );

  return {
    pricings: filtered,
    search, setSearch,
    error: error || (isError ? 'Failed to load pricing' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
    bulkDeleteTargets, setBulkDeleteTargets, handleDeleteMany, confirmBulkDelete,
    bulkDeleting: bulkDeleteMutation.isPending,
    bulkUpdate, openBulkUpdate, closeBulkUpdate,
    saveAsPdf,
  };
};
