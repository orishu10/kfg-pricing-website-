import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { expiryMessage, expirySeverity } from '../../pages/logistics/routes/utils/helpers';
import { EXPIRY_TEXT_COLORS, type RouteExpiryAlert } from '../../pages/logistics/routes/utils/consts';
import { routeAlertKey } from '../helpers';

interface ExpiryNotificationsMenuProps {
  anchorEl: HTMLElement | null;
  alerts: RouteExpiryAlert[];
  onClose: () => void;
  onOpenRoute: (routeId: string) => void;
  onDismiss: (key: string) => void;
  onDismissAll: () => void;
}

export const ExpiryNotificationsMenu = ({
  anchorEl,
  alerts,
  onClose,
  onOpenRoute,
  onDismiss,
  onDismissAll,
}: ExpiryNotificationsMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    slotProps={{ paper: { sx: { minWidth: 320, maxWidth: 380, mt: 1 } } }}
  >
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700}>Route validity</Typography>
      {alerts.length > 0 && (
        <Button
          size="small"
          startIcon={<DoneAllIcon />}
          onClick={onDismissAll}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          Mark all as read
        </Button>
      )}
    </Box>
    <Divider />
    {alerts.length === 0 ? (
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary">No route reminders.</Typography>
      </Box>
    ) : (
      alerts.map(({ route, days }) => (
        <MenuItem key={route.id} onClick={() => onOpenRoute(route.id)} sx={{ gap: 1 }}>
          <ListItemText
            primary={route.reference || route.shipping_line || `Route ${route.id}`}
            secondary={expiryMessage(days)}
            secondaryTypographyProps={{
              color: EXPIRY_TEXT_COLORS[expirySeverity(days)],
              fontWeight: 600,
            }}
          />
          <Tooltip title="Mark as read">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onDismiss(routeAlertKey(route));
              }}
            >
              <DoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MenuItem>
      ))
    )}
  </Menu>
);
