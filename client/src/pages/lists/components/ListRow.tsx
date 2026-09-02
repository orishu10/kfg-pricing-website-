import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import type { LookupOption } from '../../../api';
import { LIST_INPUT_SX, LIST_ROW_DIVIDER } from '../utils/consts';

interface ListRowProps {
  option: LookupOption;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  listDragging?: boolean;
  isLast: boolean;
  onRename: (value: string) => void;
  onDelete: () => void;
}

export const ListRow = ({
  option, provided, snapshot, listDragging, isLast, onRename, onDelete,
}: ListRowProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(option.value);
  const isDragging = snapshot?.isDragging ?? false;
  const dimmed = !!listDragging && !isDragging;

  const startEdit = () => {
    setDraft(option.value);
    setEditing(true);
  };

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== option.value) onRename(trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(option.value);
    setEditing(false);
  };

  return (
    <Box
      ref={provided?.innerRef}
      {...(provided?.draggableProps ?? {})}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 1,
        bgcolor: isDragging ? '#fff' : 'transparent',
        borderBottom: isDragging || isLast ? '1px solid transparent' : LIST_ROW_DIVIDER,
        borderRadius: isDragging ? 1.5 : 0,
        boxShadow: isDragging
          ? '0 8px 20px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.12)'
          : 'none',
        opacity: dimmed ? 0.85 : 1,
        transition: 'box-shadow 0.18s ease, background-color 0.18s ease, opacity 0.18s ease',
        '&:hover': { bgcolor: isDragging ? '#fff' : 'rgba(0,0,0,0.03)' },
        '&:hover .drag-handle': { color: 'text.secondary' },
      }}
    >
      {provided && (
        <Box
          {...provided.dragHandleProps}
          className="drag-handle"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: isDragging ? 'primary.main' : 'text.disabled',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: 'color 0.18s ease',
            '&:focus-visible': { outline: 'none', color: 'primary.main' },
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
      )}

      {editing ? (
        <TextField
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          size="small"
          autoFocus
          fullWidth
          sx={LIST_INPUT_SX}
        />
      ) : (
        <Typography sx={{ flex: 1, fontSize: '0.9rem' }}>{option.value}</Typography>
      )}

      {editing ? (
        <>
          <Tooltip title="Save">
            <IconButton size="small" color="primary" onClick={save}>
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton size="small" onClick={cancel}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title="Rename">
            <IconButton size="small" onClick={startEdit}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};
