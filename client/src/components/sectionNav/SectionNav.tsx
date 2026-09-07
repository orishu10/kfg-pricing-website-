import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export interface SectionNavItem {
  key: string;
  label: string;
  filled: number;
  total: number;
  errors?: number;
}

interface SectionNavProps {
  items: SectionNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  unitLabel?: string;
}

const progressColor = (item: SectionNavItem, active: boolean) => {
  if (item.errors) return 'primary.main';
  return active ? 'primary.main' : 'success.main';
};

export const SectionNav = ({ items, activeKey, onChange, unitLabel = 'fields' }: SectionNavProps) => {
  const filled = items.reduce((sum, item) => sum + item.filled, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {items.map((item) => {
        const active = item.key === activeKey;
        const ratio = item.total > 0 ? item.filled / item.total : 0;
        return (
          <ButtonBase
            key={item.key}
            onClick={() => onChange(item.key)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 0.75,
              px: 1.5,
              py: 1,
              borderRadius: 1,
              textAlign: 'left',
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? 'rgba(193,29,40,0.08)' : 'transparent',
              transition: 'background-color 120ms ease',
              '&:hover': { bgcolor: active ? 'rgba(193,29,40,0.1)' : 'rgba(0,0,0,0.04)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{item.label}</Typography>
              <Typography
                sx={{
                  fontSize: '0.69rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: item.errors ? 'primary.main' : active ? 'primary.main' : 'text.disabled',
                }}
              >
                {item.errors ? `${item.errors} error${item.errors === 1 ? '' : 's'}` : `${item.filled}/${item.total}`}
              </Typography>
            </Box>
            <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.round(ratio * 100)}%`,
                  bgcolor: progressColor(item, active),
                  transition: 'width 200ms ease',
                }}
              />
            </Box>
          </ButtonBase>
        );
      })}

      <Box
        sx={{
          mt: 1,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: '#fff',
          border: '1px solid rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.6, color: 'text.disabled' }}>
          OVERALL
        </Typography>
        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>
          {filled}
          <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.disabled' }}>
            {` / ${total} ${unitLabel}`}
          </Box>
        </Typography>
        <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${total > 0 ? Math.round((filled / total) * 100) : 0}%`,
              bgcolor: 'primary.main',
              transition: 'width 200ms ease',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
