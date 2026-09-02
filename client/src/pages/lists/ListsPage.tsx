import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ConfirmDialog, ErrorAlert, PageHeader } from '../../components';
import { useListPage } from './hooks/useListPage';
import { ListRow } from './components/ListRow';
import { LIST_CATEGORIES } from './utils/consts';
import type { LookupCategory, LookupOption } from '../../api';

interface ListsPageProps {
  category: LookupCategory;
}

export const ListsPage = ({ category }: ListsPageProps) => {
  const config = LIST_CATEGORIES[category];
  const { options, error, deleteTarget, setDeleteTarget, add, rename, confirmDelete, reorder } =
    useListPage(category);
  const [newValue, setNewValue] = useState('');
  const [items, setItems] = useState<LookupOption[]>(options);
  const [syncKey, setSyncKey] = useState('');

  const orderKey = options.map((option) => option.id).join(',');
  if (orderKey !== syncKey) {
    setSyncKey(orderKey);
    setItems(options);
  }

  const handleAdd = () => {
    add(newValue);
    setNewValue('');
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const next = [...items];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setItems(next);
    reorder(next.map((option) => option.id));
  };

  return (
    <>
      <PageHeader title={config.title} />

      <ErrorAlert message={error} />

      <Box
        component="form"
        onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
        sx={{ display: 'flex', gap: 1.5, mb: 2, maxWidth: 520 }}
      >
        <TextField
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`Add a ${config.singular}…`}
          size="small"
          fullWidth
          sx={{ bgcolor: '#fff' }}
        />
        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!newValue.trim()}>
          Add
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper variant="outlined" sx={{ maxWidth: 520 }}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No {config.title.toLowerCase()} yet — add one above.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lookup-list">
            {(dropProvided, dropSnapshot) => (
              <Paper
                variant="outlined"
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                sx={{
                  maxWidth: 520,
                  p: 0.75,
                  bgcolor: dropSnapshot.isDraggingOver ? 'rgba(196,18,48,0.03)' : 'background.paper',
                  transition: 'background-color 0.18s ease',
                }}
              >
                {items.map((option, index) => (
                  <Draggable key={option.id} draggableId={String(option.id)} index={index}>
                    {(dragProvided, dragSnapshot) => (
                      <ListRow
                        option={option}
                        provided={dragProvided}
                        snapshot={dragSnapshot}
                        listDragging={dropSnapshot.isDraggingOver}
                        onRename={(value) => rename(option.id, value)}
                        onDelete={() => setDeleteTarget(option)}
                      />
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </Paper>
            )}
          </Droppable>
        </DragDropContext>
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
