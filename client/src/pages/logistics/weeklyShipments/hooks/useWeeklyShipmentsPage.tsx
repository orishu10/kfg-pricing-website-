import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../../context/auth';
import {
  getWeeklyShipments, deleteWeeklyShipment, updateWeeklyShipment, createWeeklyShipment,
  getShipmentFormats,
  type ShipmentFormat, type WeeklyShipment, type WeeklyShipmentInput,
} from '../../../../api';
import { isInWeek, weekStart } from '../../utils/week';

export const useWeeklyShipmentsPage = () => {
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formatPickerOpen, setFormatPickerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ShipmentFormat | null>(null);
  const [sourceShipment, setSourceShipment] = useState<WeeklyShipment | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { data: shipments = [], isError } = useQuery({
    queryKey: ['weekly-shipments'],
    queryFn: getWeeklyShipments,
  });

  const { data: formats = [] } = useQuery({
    queryKey: ['shipment-formats'],
    queryFn: getShipmentFormats,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['weekly-shipments'] });

  const closeDialog = () => {
    setDialogOpen(false);
    setSourceShipment(null);
    setIsEdit(false);
    setFormError('');
  };

  const handleSaved = (shipment: WeeklyShipment) => {
    invalidate();
    if (shipment.etd) setMonday(weekStart(new Date(shipment.etd)));
    closeDialog();
  };

  const onFormError = (fallback: string) => (err: unknown) => {
    const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    setFormError(message || fallback);
  };

  const createMutation = useMutation({
    mutationFn: createWeeklyShipment,
    onSuccess: handleSaved,
    onError: onFormError('Failed to create shipment'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeeklyShipmentInput }) => updateWeeklyShipment(id, data),
    onSuccess: handleSaved,
    onError: onFormError('Failed to update shipment'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWeeklyShipment,
    onSuccess: invalidate,
    onError: () => setError('Failed to delete shipment'),
  });

  const toggleBookedMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeeklyShipmentInput }) => updateWeeklyShipment(id, data),
    onSuccess: invalidate,
    onError: () => setError('Failed to update shipment'),
  });

  const openFormatPicker = () => setFormatPickerOpen(true);

  const formatForShipment = (shipment: WeeklyShipment) =>
    formats.find((candidate) => candidate.id === shipment.format_id) ?? null;

  const pickFormat = (picked: ShipmentFormat | null) => {
    setFormatPickerOpen(false);
    setSelectedFormat(picked);
    setSourceShipment(null);
    setIsEdit(false);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (shipment: WeeklyShipment) => {
    setSelectedFormat(formatForShipment(shipment));
    setSourceShipment(shipment);
    setIsEdit(true);
    setFormError('');
    setDialogOpen(true);
  };

  const openDuplicate = (shipment: WeeklyShipment) => {
    setSelectedFormat(formatForShipment(shipment));
    setSourceShipment(shipment);
    setIsEdit(false);
    setFormError('');
    setDialogOpen(true);
  };

  const submitShipment = (payload: WeeklyShipmentInput) => {
    setFormError('');
    if (isEdit && sourceShipment) {
      updateMutation.mutate({ id: sourceShipment.id, data: { ...payload, updated_by: username ?? '' } });
      return;
    }
    createMutation.mutate({ ...payload, created_by: username ?? '', updated_by: username ?? '' });
  };

  const handleDelete = (shipment: WeeklyShipment) =>
    setDeleteTarget({ id: shipment.id, name: shipment.description || shipment.customer || shipment.id });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setError('');
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toggleBooked = (shipment: WeeklyShipment) => {
    setError('');
    toggleBookedMutation.mutate({
      id: shipment.id,
      data: { ...shipment, booked: !shipment.booked, updated_by: username ?? '' },
    });
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments
      .filter((shipment) => isInWeek(shipment.etd, monday))
      .filter(
        (shipment) =>
          !query ||
          [
            shipment.con, shipment.customer, shipment.description, shipment.pup,
            shipment.pol, shipment.pod, shipment.vessel, shipment.voyage, shipment.id,
            ...(shipment.suppliers ?? []),
          ].some((value) => (value ?? '').toLowerCase().includes(query)),
      );
  }, [shipments, monday, search]);

  return {
    rows, monday, setMonday, search, setSearch,
    error: error || (isError ? 'Failed to load shipments' : ''),
    formats, formError, formatPickerOpen, setFormatPickerOpen, dialogOpen,
    selectedFormat, sourceShipment, isEdit,
    openFormatPicker, pickFormat, openEdit, openDuplicate, closeDialog, submitShipment,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete, toggleBooked,
  };
};
