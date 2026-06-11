import { Card, CardContent, Typography } from "@mui/material";
import { Grid } from "@mui/system";

export const Section = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {title && (
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
            display="block"
            mb={3}
          >
            {title}
          </Typography>
        )}
        <Grid container spacing={3}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
};
