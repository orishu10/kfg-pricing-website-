import Paper from '@mui/material/Paper';
import { ListRow } from './ListRow';
import { LIST_PAPER_SX } from '../utils/consts';
import type { LookupOption } from '../../../api';

interface StaticOptionListProps {
  options: LookupOption[];
  onRename: (id: number, value: string) => void;
  onDelete: (option: LookupOption) => void;
}

export const StaticOptionList = ({ options, onRename, onDelete }: StaticOptionListProps) => (
  <Paper variant="outlined" sx={LIST_PAPER_SX}>
    {options.map((option, index) => (
      <ListRow
        key={option.id}
        option={option}
        isLast={index === options.length - 1}
        onRename={(value) => onRename(option.id, value)}
        onDelete={() => onDelete(option)}
      />
    ))}
  </Paper>
);
