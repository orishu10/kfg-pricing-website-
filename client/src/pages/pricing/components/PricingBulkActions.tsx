import Button from '@mui/material/Button';
import PercentIcon from '@mui/icons-material/Percent';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { BULK_FIELD_META, type BulkField } from '../utils/consts';

interface PricingBulkActionsProps {
  onUpdate: (field: BulkField) => void;
  onSaveAsPdf: () => void;
}

export const PricingBulkActions = ({ onUpdate, onSaveAsPdf }: PricingBulkActionsProps) => (
  <>
    <Button size="small" variant="outlined" startIcon={<CurrencyExchangeIcon />} onClick={() => onUpdate('ex_rate')}>
      {BULK_FIELD_META.ex_rate.button}
    </Button>
    <Button size="small" variant="outlined" startIcon={<PercentIcon />} onClick={() => onUpdate('us_tariff_pct')}>
      {BULK_FIELD_META.us_tariff_pct.button}
    </Button>
    <Button size="small" variant="outlined" startIcon={<PictureAsPdfOutlinedIcon />} onClick={onSaveAsPdf}>
      Save as PDF
    </Button>
  </>
);
