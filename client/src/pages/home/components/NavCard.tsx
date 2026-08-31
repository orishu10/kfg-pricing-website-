import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface NavCardProps {
  /** Image path (rendered as <img>) or a React node such as an MUI icon */
  icon: string | React.ReactNode;
  label: string;
  onClick: () => void;
}

export const NavCard = ({ icon, label, onClick }: NavCardProps) => (
  <Box
    onClick={onClick}
    sx={{
      width: 210,
      height: 150,
      bgcolor: 'background.default',
      border: '2.5px solid',
      borderColor: 'primary.main',
      borderRadius: 2.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      cursor: 'pointer',
      userSelect: 'none',
      boxShadow: '5px 6px 14px rgba(0,0,0,0.38)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '6px 10px 22px rgba(0,0,0,0.42)',
      },
      '&:active': { transform: 'translateY(0)' },
    }}
  >
    {typeof icon === 'string' ? (
      <Box component="img" src={icon} alt={label} sx={{ width: 64, height: 64, objectFit: 'contain' }} />
    ) : (
      <Box sx={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        {icon}
      </Box>
    )}
    <Typography
      sx={{
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.55rem',
        letterSpacing: 1,
        textTransform: 'uppercase',
        lineHeight: 1,
      }}
    >
      {label}
    </Typography>
  </Box>
);
