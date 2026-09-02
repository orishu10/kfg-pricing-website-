import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { CalendarDayGrid } from './CalendarDayGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarOptionGrid } from './CalendarOptionGrid';
import { CALENDAR_FOOTER_SX, NEXT_CALENDAR_VIEW, type CalendarView } from './utils/consts';
import {
  calendarTitle, monthOptions, parseIsoDate, startOfMonth, startOfToday, stepMonth, toIsoDate,
  yearOptions,
} from './utils/helpers';

interface CalendarPanelProps {
  value: string;
  onSelect: (value: string) => void;
  onClear: () => void;
}

export const CalendarPanel = ({ value, onSelect, onClear }: CalendarPanelProps) => {
  const selected = parseIsoDate(value);
  const today = startOfToday();
  const [view, setView] = useState<CalendarView>('days');
  const [month, setMonth] = useState(() => startOfMonth(selected ?? today));

  const pickMonth = (monthIndex: number) => {
    setMonth((previous) => new Date(previous.getFullYear(), monthIndex, 1));
    setView('days');
  };

  const pickYear = (year: number) => {
    setMonth((previous) => new Date(year, previous.getMonth(), 1));
    setView('months');
  };

  return (
    <Box>
      <CalendarHeader
        title={calendarTitle(month, view)}
        onStep={(direction) => setMonth((previous) => stepMonth(previous, view, direction))}
        onToggleView={() => setView(NEXT_CALENDAR_VIEW[view])}
      />

      {view === 'days' && (
        <CalendarDayGrid month={month} selected={selected} today={today} onSelect={onSelect} />
      )}
      {view === 'months' && (
        <CalendarOptionGrid options={monthOptions(month, selected)} onSelect={pickMonth} />
      )}
      {view === 'years' && (
        <CalendarOptionGrid options={yearOptions(month, selected)} onSelect={pickYear} />
      )}

      <Box sx={CALENDAR_FOOTER_SX}>
        <Button size="small" onClick={onClear} sx={{ color: 'text.secondary' }}>
          Clear
        </Button>
        <Button size="small" onClick={() => onSelect(toIsoDate(today))}>
          Today
        </Button>
      </Box>
    </Box>
  );
};
