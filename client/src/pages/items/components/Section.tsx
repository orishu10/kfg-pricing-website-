import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/system';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <Card sx={{ mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      {title && (
        <Typography variant="overline" color="primary" fontWeight={700} display="block" mb={3}>
          {title}
        </Typography>
      )}
      <Grid container spacing={3}>
        {children}
      </Grid>
    </CardContent>
  </Card>
);
