import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search…',
  size = 'small',
  fullWidth = true,
}: SearchBarProps) => (
  <TextField
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    size={size}
    fullWidth={fullWidth}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange('')} edge="end" aria-label="clear search">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      },
    }}
  />
);
