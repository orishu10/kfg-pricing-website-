import { Grid } from '@mui/system';
import { CommonInput } from '../../../../components';

interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  currency?: boolean;
  col?: boolean;
}

export const FormTextField = ({ label, value, onChange, required, currency, col }: FormTextFieldProps) => (
  <Grid size={col ? { xs: 12 } : { xs: 12, sm: 6, md: 4 }}>
    <CommonInput label={label} value={value} onChange={onChange} required={required} currency={currency} />
  </Grid>
);
