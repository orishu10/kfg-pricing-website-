import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSchedules, deleteSchedule, type Schedule } from '../../../../api';
import { isInWeek, weekStart } from '../../utils/week';

export const useSchedulesPage = () => {
  const queryClient = useQueryClient();
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: schedules = [], isError } = useQuery({
    queryKey: ['schedules'],
    queryFn: getSchedules,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
    onError: () => setError('Failed to delete schedule'),
  });

  const handleDelete = (s: Schedule) =>
    setDeleteTarget({ id: s.id, name: s.vessel || s.voyage || s.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schedules
      .filter((s) => isInWeek(s.etd, monday))
      .filter(
        (s) =>
          !q ||
          [s.vessel, s.voyage, s.pol, s.pod, s.tt, s.id]
            .some((v) => (v ?? '').toLowerCase().includes(q)),
      );
  }, [schedules, monday, search]);

  return {
    rows, monday, setMonday, search, setSearch,
    error: error || (isError ? 'Failed to load schedules' : ''),
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  };
};
