import Box from '@mui/material/Box';
import { FormField } from '../../components/form';
import { appendRow, removeRow, updateRow } from '../utils/helpers';
import type { ShipmentDocumentColumn } from '../utils/consts';
import type { ShipmentDocumentRow } from '../../../../api';
import { AddRowButton, RemoveRowButton } from './RowActions';

interface DocumentRowGroupProps {
  addLabel: string;
  rows: ShipmentDocumentRow[];
  columns: ShipmentDocumentColumn[];
  onChange: (rows: ShipmentDocumentRow[]) => void;
}

export const DocumentRowGroup = ({ addLabel, rows, columns, onChange }: DocumentRowGroupProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    {rows.map((row, index) => (
      <Box
        key={index}
        sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr) auto`, gap: 1 }}
      >
        {columns.map((column) => (
          <FormField
            key={column.key}
            label={index === 0 ? column.label : undefined}
            type={column.type}
            value={row[column.key]}
            onChange={(value) => onChange(updateRow(rows, index, column.key, value))}
          />
        ))}
        <RemoveRowButton label={`Remove ${addLabel}`} onClick={() => onChange(removeRow(rows, index))} />
      </Box>
    ))}
    <AddRowButton label={addLabel} onClick={() => onChange(appendRow(rows))} />
  </Box>
);
