import { useState } from 'react';
import Paper from '@mui/material/Paper';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ListRow } from './ListRow';
import { LIST_PAPER_SX } from '../utils/consts';
import type { LookupOption } from '../../../api';

interface SortableOptionListProps {
  options: LookupOption[];
  onRename: (id: number, value: string) => void;
  onDelete: (option: LookupOption) => void;
  onReorder: (ids: number[]) => void;
}

export const SortableOptionList = ({ options, onRename, onDelete, onReorder }: SortableOptionListProps) => {
  const [items, setItems] = useState<LookupOption[]>(options);
  const [syncKey, setSyncKey] = useState('');

  const orderKey = options.map((option) => option.id).join(',');
  if (orderKey !== syncKey) {
    setSyncKey(orderKey);
    setItems(options);
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;
    const next = [...items];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setItems(next);
    onReorder(next.map((option) => option.id));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="lookup-list">
        {(dropProvided, dropSnapshot) => (
          <Paper
            variant="outlined"
            ref={dropProvided.innerRef}
            {...dropProvided.droppableProps}
            sx={{
              ...LIST_PAPER_SX,
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
                    isLast={index === items.length - 1}
                    onRename={(value) => onRename(option.id, value)}
                    onDelete={() => onDelete(option)}
                  />
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
          </Paper>
        )}
      </Droppable>
    </DragDropContext>
  );
};
