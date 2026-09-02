import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { OPTION_CELL_SX, OPTION_GRID_SX, SELECTED_CELL_SX, type CalendarOption } from './utils/consts';

interface CalendarOptionGridProps {
  options: CalendarOption[];
  onSelect: (value: number) => void;
}

export const CalendarOptionGrid = ({ options, onSelect }: CalendarOptionGridProps) => (
  <Box sx={OPTION_GRID_SX}>
    {options.map((option) => (
      <ButtonBase
        key={option.label}
        onClick={() => onSelect(option.value)}
        sx={{ ...OPTION_CELL_SX, ...(option.selected ? SELECTED_CELL_SX : {}) }}
      >
        {option.label}
      </ButtonBase>
    ))}
  </Box>
);
