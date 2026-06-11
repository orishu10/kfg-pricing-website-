import { Typography } from "@mui/material";
import { Grid, Box } from "@mui/system";

export const IdentityField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {label}
      </Typography>
      <Box
        sx={{
          bgcolor: "action.hover",
          borderRadius: 1,
          px: 1.5,
          py: 1,
          mt: 0.5,
        }}
      >
        <Typography variant="body2" fontFamily="monospace">
          {value || "—"}
        </Typography>
      </Box>
    </Grid>
  );
};
