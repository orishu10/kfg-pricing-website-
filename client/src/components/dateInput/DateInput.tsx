import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import type { SxProps, Theme } from '@mui/material/styles';
import { CalendarPanel } from './CalendarPanel';
import {
  CALENDAR_ICON_SX, CALENDAR_PAPER_SX, CLEAR_DATE_BUTTON_SX, CLEAR_DATE_ICON_SX, OPEN_CALENDAR_KEYS,
} from './utils/consts';
import { formatDisplayDate, mergeSx } from './utils/helpers';

interface DateInputProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  helperText?: string;
  inputSx?: SxProps<Theme>;
}

export const DateInput = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  size = 'small',
  fullWidth = true,
  required,
  disabled,
  readOnly,
  error,
  helperText,
  inputSx,
}: DateInputProps) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const interactive = !disabled && !readOnly && onChange !== undefined;

  const openCalendar = (element: HTMLElement) => {
    if (interactive) setAnchorElement(element);
  };

  const selectDate = (selected: string) => {
    onChange?.(selected);
    setAnchorElement(null);
  };

  const clearDate = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectDate('');
  };

  return (
    <>
      <TextField
        label={label}
        value={formatDisplayDate(value)}
        placeholder={placeholder}
        size={size}
        fullWidth={fullWidth}
        required={required}
        disabled={disabled}
        error={error}
        helperText={helperText}
        onClick={(event) => openCalendar(event.currentTarget)}
        onKeyDown={(event) => {
          if (!OPEN_CALENDAR_KEYS.includes(event.key)) return;
          event.preventDefault();
          openCalendar(event.currentTarget);
        }}
        slotProps={{
          input: {
            readOnly: true,
            sx: mergeSx({ cursor: interactive ? 'pointer' : 'default' }, inputSx),
            endAdornment: (
              <InputAdornment position="end">
                {value && interactive && (
                  <IconButton
                    aria-label="Clear date"
                    onClick={clearDate}
                    size="small"
                    sx={CLEAR_DATE_BUTTON_SX}
                  >
                    <CloseIcon sx={CLEAR_DATE_ICON_SX} />
                  </IconButton>
                )}
                <CalendarMonthOutlinedIcon sx={CALENDAR_ICON_SX} />
              </InputAdornment>
            ),
          },
          htmlInput: { sx: { cursor: 'inherit' } },
        }}
      />
      <Popover
        open={anchorElement !== null}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: CALENDAR_PAPER_SX } }}
      >
        <CalendarPanel value={value} onSelect={selectDate} onClear={() => selectDate('')} />
      </Popover>
    </>
  );
};
