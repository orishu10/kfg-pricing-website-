import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { expiryShortLabel, groupAlertsBySeverity, routeLane, routeTitle } from '../../pages/logistics/routes/utils/helpers';
import {
  EXPIRY_CHIP_STYLES, EXPIRY_GROUP_LABELS, EXPIRY_TEXT_COLORS, type RouteExpiryAlert,
} from '../../pages/logistics/routes/utils/consts';
import { routeAlertKey } from '../helpers';
import { timeAgo } from '../../utils/time';

interface ExpiryNotificationsMenuProps {
  anchorEl: HTMLElement | null;
  alerts: RouteExpiryAlert[];
  lastSentAt: string | null;
  onClose: () => void;
  onOpenRoute: (routeId: string) => void;
  onExtendRoute: (routeId: string) => void;
  onShowInRoutes: () => void;
  onDismiss: (key: string) => void;
  onDismissAll: () => void;
}

export const ExpiryNotificationsMenu = ({
  anchorEl,
  alerts,
  lastSentAt,
  onClose,
  onOpenRoute,
  onExtendRoute,
  onShowInRoutes,
  onDismiss,
  onDismissAll,
}: ExpiryNotificationsMenuProps) => {
  const groups = groupAlertsBySeverity(alerts);

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 400, maxWidth: 'calc(100vw - 32px)', mt: 1 } } }}
    >
      <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>Route validity</Typography>
          {alerts.length > 0 && (
            <Chip
              size="small"
              label={`${alerts.length} open`}
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: 'rgba(193,29,40,0.1)', color: 'primary.main' }}
            />
          )}
        </Box>
        {alerts.length > 0 && (
          <Button size="small" startIcon={<DoneAllIcon />} onClick={onDismissAll} sx={{ whiteSpace: 'nowrap' }}>
            Mark all read
          </Button>
        )}
      </Box>
      <Divider />

      {alerts.length === 0 ? (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" color="text.secondary">No route reminders. Nothing expires within 7 days.</Typography>
        </Box>
      ) : (
        groups.map(({ severity, alerts: groupAlerts }) => (
          <Box key={severity}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, pt: 1.25, pb: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: EXPIRY_CHIP_STYLES[severity].bgcolor }} />
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: EXPIRY_TEXT_COLORS[severity] }}>
                {EXPIRY_GROUP_LABELS[severity].toUpperCase()} · {groupAlerts.length}
              </Typography>
            </Box>
            {groupAlerts.map(({ route, days }) => (
              <MenuItem
                key={route.id}
                onClick={() => onOpenRoute(route.id)}
                sx={{
                  gap: 1.25,
                  py: 1,
                  alignItems: 'center',
                  '& .extend-action': { opacity: 0, transition: 'opacity 120ms ease' },
                  '&:hover .extend-action, &:focus-within .extend-action': { opacity: 1 },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }} noWrap>
                    {routeTitle(route)}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', lineHeight: 1.3 }} noWrap>
                    {routeLane(route) || `Route ${route.id}`}
                  </Typography>
                </Box>
                <Button
                  className="extend-action"
                  size="small"
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
                    onExtendRoute(route.id);
                  }}
                  sx={{ fontSize: '0.72rem', py: 0.25, px: 1, whiteSpace: 'nowrap' }}
                >
                  Extend validity
                </Button>
                <Chip
                  size="small"
                  label={expiryShortLabel(days)}
                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, ...EXPIRY_CHIP_STYLES[severity] }}
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
            ))}
          </Box>
        ))
      )}

      <Divider sx={{ mt: 0.5 }} />
      <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {lastSentAt ? `Email digest sent ${timeAgo(lastSentAt)}` : 'No email digest sent yet'}
        </Typography>
        <Button size="small" onClick={onShowInRoutes} sx={{ fontWeight: 700 }}>
          Show in Routes
        </Button>
      </Box>
    </Menu>
  );
};
