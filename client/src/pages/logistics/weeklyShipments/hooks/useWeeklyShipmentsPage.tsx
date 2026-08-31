import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../context/auth';
import {
  getWeeklyShipments, deleteWeeklyShipment, updateWeeklyShipment,
  type WeeklyShipment, type WeeklyShipmentInput,
} from '../../../../api';
import { isInWeek, weekStart } from '../../utils/week';

export const useWeeklyShipmentsPage = () => {
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: shipments = [], isError } = useQuery({
    queryKey: ['weekly-shipments'],
    queryFn: getWeeklyShipments,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['weekly-shipments'] });

  const deleteMutation = useMutation({
    mutationFn: deleteWeeklyShipment,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete shipment'),
  });

  const bookedMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeeklyShipmentInput }) => updateWeeklyShipment(id, data),
    onSuccess: invalidate,
    onError: () => setError('Failed to update shipment'),
  });

  const handleDelete = (s: WeeklyShipment) =>
    setDeleteTarget({ id: s.id, name: s.description || s.customer || s.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toggleBooked = (s: WeeklyShipment) => {
    setError('');
    bookedMutation.mutate({
      id: s.id,
      data: {
        con: s.con, customer: s.customer, supplier: s.supplier, description: s.description,
        pup: s.pup, pol: s.pol, pod: s.pod, vessel: s.vessel, voyage: s.voyage,
        etd: s.etd, eta: s.eta, booked: !s.booked, updated_by: username ?? '',
      },
    });
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments
      .filter((s) => isInWeek(s.etd, monday))
      .filter(
        (s) =>
          !q ||
          [s.con, s.customer, s.supplier, s.description, s.pup, s.pol, s.pod, s.vessel, s.voyage, s.id]
            .some((v) => (v ?? '').toLowerCase().includes(q)),
      );
  }, [shipments, monday, search]);

  return {
    rows, monday, setMonday, search, setSearch,
    error: error || (isError ? 'Failed to load shipments' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete, toggleBooked,
  };
};
