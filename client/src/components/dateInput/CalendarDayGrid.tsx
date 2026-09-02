import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {
  CALENDAR_CELL_SX, DAY_GRID_SX, SELECTED_CELL_SX, TODAY_CELL_SX, WEEKDAY_LABEL_SX, WEEKDAY_LABELS,
} from './utils/consts';
import { buildCalendarDays, isSameDay, toIsoDate } from './utils/helpers';

interface CalendarDayGridProps {
  month: Date;
  selected: Date | null;
  today: Date;
  onSelect: (value: string) => void;
}

export const CalendarDayGrid = ({ month, selected, today, onSelect }: CalendarDayGridProps) => (
  <>
    <Box sx={{ ...DAY_GRID_SX, mb: 0.5 }}>
      {WEEKDAY_LABELS.map((weekday) => (
        <Typography key={weekday} sx={WEEKDAY_LABEL_SX}>
          {weekday}
        </Typography>
      ))}
    </Box>
    <Box sx={DAY_GRID_SX}>
      {buildCalendarDays(month).map((day) => {
        const isSelected = selected !== null && isSameDay(day, selected);
        const isOutsideMonth = day.getMonth() !== month.getMonth();
        return (
          <ButtonBase
            key={toIsoDate(day)}
            onClick={() => onSelect(toIsoDate(day))}
            sx={{
              ...CALENDAR_CELL_SX,
              color: isOutsideMonth ? 'text.disabled' : 'text.primary',
              ...(isSameDay(day, today) && !isSelected ? TODAY_CELL_SX : {}),
              ...(isSelected ? SELECTED_CELL_SX : {}),
            }}
          >
            {day.getDate()}
          </ButtonBase>
        );
      })}
    </Box>
  </>
);
