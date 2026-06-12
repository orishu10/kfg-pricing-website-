import { Grid } from '@mui/system';
import { CommonSelect } from '../../../../components';

interface FormSelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}

export const FormSelectField = ({ label, value, onChange, options }: FormSelectFieldProps) => (
  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
    <CommonSelect label={label} value={value} onChange={onChange} options={options} />
  </Grid>
);
