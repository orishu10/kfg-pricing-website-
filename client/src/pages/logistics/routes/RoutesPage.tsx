import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRoutesPage } from './hooks/useRoutesPage';
import { ConfirmDialog, DataTable, ErrorAlert, type Column } from '../../../components';
import { fmtDate } from '../../pricing/utils/helpers';
import { formatDate } from '../../../utils/time';
import { formatFileSize } from '../../../utils/format';
import { saveBlob } from '../../../utils/download';
import { daysUntil, expiryAlerts, isWithinExpiryWindow, validityChip } from './utils/helpers';
import { EXPIRY_STAGE_LABELS } from './utils/consts';
import { downloadRouteFile, getRouteExpiryStatus, type Route } from '../../../api';

const validityTooltip = (route: Route, sentStages: string[]) =>
  [
    `Expires ${formatDate(route.validity)}`,
    ...sentStages.map((stage) => EXPIRY_STAGE_LABELS[stage] ?? stage),
  ].join(' · ');

const buildColumns = (
  sentStages: Record<string, string[]>,
  onDownloadFile: (route: Route) => void,
): Column<Route>[] => [
  { key: 'id', label: '#', mono: true, align: 'center' },
  {
    key: 'reference',
    label: 'Reference',
    mono: true,
    render: (r) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {r.reference ?? ''}
        {r.file_name && (
          <Tooltip title={`${r.file_name} · ${formatFileSize(r.file_size)}`}>
            <IconButton
              size="small"
              aria-label={`Download ${r.file_name}`}
              onClick={(event) => {
                event.stopPropagation();
                onDownloadFile(r);
              }}
              sx={{ p: 0.25 }}
            >
              <AttachFileIcon sx={{ fontSize: '0.95rem', color: 'text.secondary' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
  },
  { key: 'shipping_line', label: 'Shipping Line', sortable: true, render: (r) => r.shipping_line ?? '' },
  { key: 'origin', label: 'Origin', sortable: true, render: (r) => r.origin ?? '' },
  { key: 'destination', label: 'Destination', sortable: true, render: (r) => r.destination ?? '' },
  { key: 'tt', label: 'TT', align: 'center', render: (r) => r.tt ?? '' },
  {
    key: 'validity',
    label: 'Validity',
    sortable: true,
    value: (r) => r.validity,
    render: (r) => {
      const days = daysUntil(r.validity);
      const chip = days != null && isWithinExpiryWindow(days) ? validityChip(days) : null;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {fmtDate(r.validity)}
          {chip && (
            <Tooltip title={validityTooltip(r, sentStages[r.id] ?? [])}>
              <Chip
                size="small"
                label={chip.label}
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ...chip.styles }}
              />
            </Tooltip>
          )}
        </Box>
      );
    },
  },
];

export const RoutesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [fileError, setFileError] = useState('');
  const {
    routes, allRoutes, search, setSearch, error,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
  } = useRoutesPage();

  const { data: expiryStatus } = useQuery({
    queryKey: ['route-expiry-status'],
    queryFn: getRouteExpiryStatus,
    staleTime: 5 * 60 * 1000,
  });

  const expiringOnly = searchParams.get('expiring') === '1';
  const setExpiringOnly = (on: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (on) next.set('expiring', '1');
    else next.delete('expiring');
    setSearchParams(next, { replace: true });
  };

  const alerts = expiryAlerts(allRoutes);
  const expiredCount = alerts.filter((alert) => alert.days < 0).length;
  const upcomingCount = alerts.length - expiredCount;
  const showBanner = alerts.length > 0 && !bannerDismissed;

  const rows = expiringOnly
    ? routes.filter((route) => {
        const days = daysUntil(route.validity);
        return days != null && isWithinExpiryWindow(days);
      })
    : routes;

  const downloadFile = async (route: Route) => {
    if (!route.file_name) return;
    setFileError('');
    try {
      saveBlob(await downloadRouteFile(route.id), route.file_name);
    } catch {
      setFileError(`Failed to download ${route.file_name}`);
    }
  };

  const columns = buildColumns(expiryStatus?.sentStages ?? {}, downloadFile);

  return (
    <>
      <ErrorAlert message={error || fileError} />

      {showBanner && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            mb: 2,
            bgcolor: '#fff8e1',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 2,
          }}
        >
          <WarningAmberIcon sx={{ color: '#ed6c02' }} />
          <Typography sx={{ flex: 1, fontSize: '0.85rem' }}>
            {upcomingCount > 0 && (
              <>
                <b>{upcomingCount} route{upcomingCount === 1 ? '' : 's'} expire{upcomingCount === 1 ? 's' : ''} within 7 days</b>
                {expiredCount > 0 ? ', ' : '.'}
              </>
            )}
            {expiredCount > 0 && (
              <>
                {upcomingCount > 0 ? '' : <b>Attention: </b>}
                {expiredCount} {expiredCount === 1 ? 'has' : 'have'} already expired.
              </>
            )}
          </Typography>
          <Chip
            label="Expiring only"
            clickable
            color={expiringOnly ? 'primary' : 'default'}
            variant={expiringOnly ? 'filled' : 'outlined'}
            onClick={() => setExpiringOnly(!expiringOnly)}
            sx={{ fontWeight: 700 }}
          />
          <IconButton size="small" aria-label="Dismiss" onClick={() => setBannerDismissed(true)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      <DataTable
        title="Routes"
        exportFileName="routes"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by reference, agent, line or port…"
        onAdd={() => navigate('/logistics/routes/new')}
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        onRowClick={(r) => navigate(`/logistics/routes/${r.id}`)}
        onEdit={(r) => navigate(`/logistics/routes/${r.id}`)}
        onDuplicate={(r) => navigate(`/logistics/routes/new?from=${r.id}`)}
        onDelete={handleDelete}
        emptyMessage={expiringOnly ? 'No routes expiring within 7 days.' : 'No routes.'}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete route?"
        target={deleteTarget?.name}
        message="Shipments and pricing that reference this route keep its ID but lose the link. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default RoutesPage;
