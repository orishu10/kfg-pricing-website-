import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid2 from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import { getCustomers, getAllSuppliers } from '../../api';
import { useAuth } from '../../context/AuthContext';

interface StatCard {
  label: string;
  count: number | null;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function HomePage() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [supplierCount, setSupplierCount] = useState<number | null>(null);

  useEffect(() => {
    getCustomers().then(d => setCustomerCount(d.length)).catch(() => setCustomerCount(0));
    getAllSuppliers().then(d => setSupplierCount(d.length)).catch(() => setSupplierCount(0));
  }, []);

  const cards: StatCard[] = [
    {
      label: 'Customers',
      count: customerCount,
      icon: <PeopleOutlineIcon sx={{ fontSize: 40 }} />,
      color: '#5b8dee',
      path: '/customers',
    },
    {
      label: 'Suppliers',
      count: supplierCount,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#56b98e',
      path: '/customers',
    },
    {
      label: 'Items',
      count: null,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#e0a84b',
      path: '/customers',
    },
  ];

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.5px">
          Welcome back{username ? `, ${username}` : ''}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your customers, suppliers, and pricing from one place.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4, opacity: 0.15 }} />

      {/* Stat cards */}
      <Grid2 container spacing={3}>
        {cards.map(card => (
          <Grid2 key={card.label} size={{ xs: 12, sm: 4 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
                height: '100%',
              }}
            >
              <CardActionArea onClick={() => navigate(card.path)} sx={{ height: '100%', p: 0 }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 3,
                    '&:last-child': { pb: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: `${card.color}1a`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ lineHeight: 1.1 }}
                    >
                      {card.count !== null ? card.count : '—'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      {card.label}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Quick action */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 3,
              }}
            >
              <CardActionArea onClick={() => navigate('/customers')} sx={{ p: 0 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <PeopleOutlineIcon sx={{ color: '#5b8dee', fontSize: 28 }} />
                  <Box>
                    <Typography fontWeight={600}>Browse Customers</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage customer accounts</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid2>
        </Grid2>
      </Box>
    </Box>
  );
}
