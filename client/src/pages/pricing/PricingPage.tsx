import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PercentIcon from '@mui/icons-material/Percent';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { usePricingPage } from './hooks/usePricingPage';
import { PricingBulkActions } from './components/PricingBulkActions';
import { PricingBulkUpdateDialog } from './components/PricingBulkUpdateDialog';
import { ConfirmDialog, DataTable, ErrorAlert, type Column, type RowMenuItem } from '../../components';
import { fmtDate, pricingLabel } from './utils/helpers';
import { BULK_PREVIEW_LIMIT, PRICING_STATUS_STYLES } from './utils/consts';
import { partyLabel } from '../../utils/format';
import type { Pricing } from '../../api';

const statusCell = (r: Pricing) => {
  if (!r.status) return '';
  const styles = PRICING_STATUS_STYLES[r.status] ?? PRICING_STATUS_STYLES.Inactive;
  return <Chip size="small" label={r.status} sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ...styles }} />;
};

const columns: Column<Pricing>[] = [
  { key: 'id', label: '#', mono: true, align: 'center' },
  { key: 'kfg_sku', label: 'KFG SKU #', mono: true, render: (r) => r.kfg_sku ?? '' },
  {
    key: 'customer_name',
    label: 'Customer',
    sortable: true,
    render: (r) => partyLabel(r.customer_short_name, r.customer_name),
  },
  {
    key: 'supplier_name',
    label: 'Supplier',
    sortable: true,
    render: (r) => partyLabel(r.supplier_short_name, r.supplier_name),
  },
  { key: 'description', label: 'Description', sortable: true, render: (r) => r.description ?? '' },
  { key: 'size', label: 'Size', render: (r) => r.size ?? '' },
  { key: 'status', label: 'Status', filterable: true, value: (r) => r.status, render: statusCell },
  {
    key: 'updated_at',
    label: 'Last Updated',
    sortable: true,
    value: (r) => r.updated_at ?? r.created_at,
    render: (r) => fmtDate(r.updated_at ?? r.created_at),
  },
];

const BulkDeleteList = ({ rows }: { rows: Pricing[] }) => {
  const preview = rows.slice(0, BULK_PREVIEW_LIMIT);
  const hidden = rows.length - preview.length;
  return (
    <Box sx={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 1, maxHeight: 200, overflowY: 'auto' }}>
      {preview.map((row, index) => (
        <Typography
          key={row.id}
          noWrap
          sx={{
            px: 1.5,
            py: 0.75,
            fontSize: '0.8rem',
            borderBottom: index < preview.length - 1 || hidden > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none',
          }}
        >
          <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{pricingLabel(row)}</Box>
          {' · '}
          {partyLabel(row.customer_short_name, row.customer_name)}
          {row.description ? ` · ${row.description}` : ''}
        </Typography>
      ))}
      {hidden > 0 && (
        <Typography sx={{ px: 1.5, py: 0.75, fontSize: '0.75rem', color: 'text.secondary' }}>and {hidden} more</Typography>
      )}
    </Box>
  );
};

export const PricingPage = () => {
  const navigate = useNavigate();
  const {
    pricings, search, setSearch, error,
    deleteTarget, setDeleteTarget, handleDelete, confirmDelete,
    bulkDeleteTargets, setBulkDeleteTargets, handleDeleteMany, confirmBulkDelete, bulkDeleting,
    bulkUpdate, openBulkUpdate, closeBulkUpdate, saveAsPdf,
  } = usePricingPage();

  const rowMenuItems = (row: Pricing): RowMenuItem<Pricing>[] => [
    { label: 'Save as PDF', icon: <PictureAsPdfOutlinedIcon fontSize="small" />, onClick: () => saveAsPdf([row]) },
    {
      label: 'Update Ex Rate',
      icon: <CurrencyExchangeIcon fontSize="small" />,
      onClick: () => openBulkUpdate('ex_rate', [row]),
    },
    {
      label: 'Update Tariff %',
      icon: <PercentIcon fontSize="small" />,
      onClick: () => openBulkUpdate('us_tariff_pct', [row]),
    },
  ];

  return (
    <>
      <ErrorAlert message={error} />

      <DataTable
        title="Pricing"
        exportFileName="pricing"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by SKU, customer, supplier or description…"
        onAdd={() => navigate('/pricing/new')}
        columns={columns}
        rows={pricings}
        getRowId={(p) => p.id}
        selectable
        renderBulkActions={(selected, clear) => (
          <PricingBulkActions
            onUpdate={(field) => openBulkUpdate(field, selected, clear)}
            onSaveAsPdf={() => saveAsPdf(selected)}
          />
        )}
        onRowClick={(p) => navigate(`/pricing/${p.id}`)}
        onEdit={(p) => navigate(`/pricing/${p.id}`)}
        onDuplicate={(p) => navigate(`/pricing/new?from=${p.id}`)}
        onDelete={handleDelete}
        onDeleteMany={handleDeleteMany}
        rowMenuItems={rowMenuItems}
        emptyMessage="No pricing records."
      />

      <PricingBulkUpdateDialog
        field={bulkUpdate?.field ?? null}
        rows={bulkUpdate?.rows ?? []}
        onClose={closeBulkUpdate}
        onDone={bulkUpdate?.onDone ?? (() => {})}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete pricing?"
        target={deleteTarget ? pricingLabel(deleteTarget) : undefined}
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        title={`Delete ${bulkDeleteTargets.length} pricing record${bulkDeleteTargets.length === 1 ? '' : 's'}?`}
        details={<BulkDeleteList rows={bulkDeleteTargets} />}
        message="This cannot be undone. Rows are deleted one by one; if one fails the rest are kept and reported."
        confirmLabel={`Delete ${bulkDeleteTargets.length}`}
        busy={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTargets([])}
      />
    </>
  );
};

export default PricingPage;
