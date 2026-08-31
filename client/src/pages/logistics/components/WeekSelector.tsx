import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { addWeeks, formatWeekRange, isoWeek } from '../utils/week';

interface WeekSelectorProps {
  monday: Date;
  onChange: (monday: Date) => void;
}

const arrowSx = {
  borderRadius: 0,
  color: 'primary.main',
  '&:hover': { bgcolor: 'rgba(196,18,48,0.08)' },
} as const;

export const WeekSelector = ({ monday, onChange }: WeekSelectorProps) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'stretch',
      border: '1px solid rgba(0,0,0,0.12)',
      borderRadius: 999,
      overflow: 'hidden',
      bgcolor: '#fff',
    }}
  >
    <IconButton size="small" onClick={() => onChange(addWeeks(monday, -1))} aria-label="Previous week" sx={arrowSx}>
      <ChevronLeftIcon fontSize="small" />
    </IconButton>
    <Box
      sx={{
        px: 2,
        py: 0.5,
        minWidth: 140,
        textAlign: 'center',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'primary.main', lineHeight: 1.2, letterSpacing: '0.5px' }}>
        WEEK {isoWeek(monday)}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.2 }}>
        {formatWeekRange(monday)}
      </Typography>
    </Box>
    <IconButton size="small" onClick={() => onChange(addWeeks(monday, 1))} aria-label="Next week" sx={arrowSx}>
      <ChevronRightIcon fontSize="small" />
    </IconButton>
  </Box>
);
