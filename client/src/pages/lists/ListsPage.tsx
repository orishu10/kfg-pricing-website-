import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog, ErrorAlert, PageHeader } from '../../components';
import { useListPage } from './hooks/useListPage';
import { SortableOptionList } from './components/SortableOptionList';
import { StaticOptionList } from './components/StaticOptionList';
import { LIST_CATEGORIES, LIST_INPUT_SX, LIST_MAX_WIDTH } from './utils/consts';
import type { LookupCategory } from '../../api';

interface ListsPageProps {
  category: LookupCategory;
}

export const ListsPage = ({ category }: ListsPageProps) => {
  const config = LIST_CATEGORIES[category];
  const { options, error, deleteTarget, setDeleteTarget, add, rename, confirmDelete, reorder } =
    useListPage(category);
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    add(newValue);
    setNewValue('');
  };

  return (
    <>
      <PageHeader title={config.title} />

      <ErrorAlert message={error} />

      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
        sx={{ display: 'flex', gap: 1.5, mb: 2, maxWidth: LIST_MAX_WIDTH }}
      >
        <TextField
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add a ${config.singular}…`}
          size="small"
          fullWidth
          sx={LIST_INPUT_SX}
        />
        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!newValue.trim()}>
          Add
        </Button>
      </Box>

      {options.length === 0 && (
        <Paper variant="outlined" sx={{ maxWidth: LIST_MAX_WIDTH }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No {config.title.toLowerCase()} yet — add one above.
            </Typography>
          </Box>
        </Paper>
      )}

      {options.length > 0 && config.reorderable && (
        <SortableOptionList
          options={options}
          onRename={rename}
          onDelete={setDeleteTarget}
          onReorder={reorder}
        />
      )}

      {options.length > 0 && !config.reorderable && (
        <StaticOptionList options={options} onRename={rename} onDelete={setDeleteTarget} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${config.singular}?`}
        message={`Remove "${deleteTarget?.value}" from the ${config.title} list? Existing records that use it are not changed.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default ListsPage;
