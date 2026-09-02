import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
  size?: 'small' | 'medium';
}

export const PasswordVisibilityToggle = ({ visible, onToggle, size = 'small' }: PasswordVisibilityToggleProps) => {
  const label = visible ? 'Hide password' : 'Show password';

  return (
    <InputAdornment position="end">
      <Tooltip title={label}>
        <IconButton
          aria-label={label}
          onClick={onToggle}
          onMouseDown={(event) => event.preventDefault()}
          edge="end"
          size={size}
          sx={{ color: 'text.secondary' }}
        >
          {visible ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </InputAdornment>
  );
};
