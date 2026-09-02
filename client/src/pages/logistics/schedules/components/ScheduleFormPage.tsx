import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../context/auth';
import { ErrorAlert, LoadingPage } from '../../../../components';
import { useLookups } from '../../../../hooks/useLookups';
import { FormField, FormSelect, FormPanel, gridSx } from '../../components/form';
import { EMPTY_SCHEDULE, type ScheduleForm } from '../utils/consts';
import { scheduleToForm } from '../utils/helpers';
import {
  getSchedule, createSchedule, updateSchedule, type ScheduleInput,
} from '../../../../api';

export const ScheduleFormPage = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const isEdit = !!scheduleId;
  const sourceId = scheduleId ?? fromId ?? undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const { options } = useLookups();
  const [error, setError] = useState('');
  const [form, setForm] = useState<ScheduleForm>(EMPTY_SCHEDULE);

  const sourceQuery = useQuery({
    queryKey: ['schedule', sourceId],
    queryFn: () => getSchedule(sourceId!),
    enabled: !!sourceId,
  });

  const s = sourceQuery.data;
  const sig = sourceId ? (s ? `${isEdit ? 'edit' : 'dup'}:${s.id}:${s.updated_at ?? ''}` : null) : '__new__';
  const [synced, setSynced] = useState<string | null>(null);
  if (sig && sig !== synced) {
    setSynced(sig);
    setForm(s ? scheduleToForm(s) : EMPTY_SCHEDULE);
  }

  const set = (k: keyof ScheduleForm) => (v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const onError = (fallback: string) => (err: unknown) => {
    const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setError(msg || fallback);
  };
  const done = () => {
    queryClient.invalidateQueries({ queryKey: ['schedules'] });
    navigate('/logistics/schedules');
  };

  const createMutation = useMutation({
    mutationFn: (data: ScheduleInput) => createSchedule(data),
    onSuccess: done,
    onError: onError('Failed to create schedule'),
  });
  const updateMutation = useMutation({
    mutationFn: (data: ScheduleInput) => updateSchedule(scheduleId!, data),
    onSuccess: done,
    onError: onError('Failed to update schedule'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload: ScheduleInput = { ...form, created_by: username ?? '', updated_by: username ?? '' };
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (sourceId && sourceQuery.isLoading) return <LoadingPage />;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/logistics/schedules')} sx={{ textTransform: 'none' }}>
          Schedules
        </Button>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          {isEdit ? `Schedule ${scheduleId}` : 'New Schedule'}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}><ErrorAlert message={error} /></Box>

      <FormPanel>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={gridSx(4)}>
            <FormField label="Vessel" value={form.vessel} onChange={set('vessel')} />
            <FormField label="Voyage" value={form.voyage} onChange={set('voyage')} />
            <FormSelect label="POL" value={form.pol} onChange={set('pol')} options={options('sea_port', form.pol)} />
            <FormSelect label="POD" value={form.pod} onChange={set('pod')} options={options('sea_port', form.pod)} />
          </Box>
          <Box sx={gridSx(3)}>
            <FormField label="ETD" type="date" value={form.etd} onChange={set('etd')} />
            <FormField label="ETA" type="date" value={form.eta} onChange={set('eta')} />
            <FormField label="TT" value={form.tt} onChange={set('tt')} />
          </Box>
          <Box sx={gridSx(3)}>
            <FormField label="DDL CON #" value={form.ddl_con} onChange={set('ddl_con')} />
            <FormField label="DDL Docs" value={form.ddl_docs} onChange={set('ddl_docs')} />
            <FormField label="DDL Port" value={form.ddl_port} onChange={set('ddl_port')} />
          </Box>
        </Box>
      </FormPanel>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/logistics/schedules')}>Cancel</Button>
        <Button type="submit" variant="contained" size="large">Save</Button>
      </Box>
    </Box>
  );
};

export default ScheduleFormPage;
