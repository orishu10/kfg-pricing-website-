import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { CALENDAR_HEADER_SX, CALENDAR_TITLE_BUTTON_SX, CALENDAR_TITLE_SX } from './utils/consts';

interface CalendarHeaderProps {
  title: string;
  onStep: (direction: number) => void;
  onToggleView: () => void;
}

export const CalendarHeader = ({ title, onStep, onToggleView }: CalendarHeaderProps) => (
  <Box sx={CALENDAR_HEADER_SX}>
    <IconButton size="small" aria-label="Previous" onClick={() => onStep(-1)}>
      <ChevronLeftIcon fontSize="small" />
    </IconButton>
    <ButtonBase onClick={onToggleView} sx={CALENDAR_TITLE_BUTTON_SX}>
      <Typography sx={CALENDAR_TITLE_SX}>{title}</Typography>
    </ButtonBase>
    <IconButton size="small" aria-label="Next" onClick={() => onStep(1)}>
      <ChevronRightIcon fontSize="small" />
    </IconButton>
  </Box>
);
