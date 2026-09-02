import type { LookupCategory } from '../../../api';

export interface ListCategoryConfig {
  category: LookupCategory;
  title: string;
  singular: string;
  reorderable: boolean;
}

export const LIST_MAX_WIDTH = 520;

export const LIST_INPUT_SX = { '& .MuiOutlinedInput-root': { bgcolor: '#fff' } } as const;

export const LIST_ROW_DIVIDER = '1px solid rgba(0,0,0,0.08)';

export const LIST_PAPER_SX = { maxWidth: LIST_MAX_WIDTH, p: 0.75 } as const;

export const LIST_CATEGORIES: Record<LookupCategory, ListCategoryConfig> = {
  incoterms: { category: 'incoterms', title: 'Incoterms', singular: 'incoterm', reorderable: false },
  currency_pair: { category: 'currency_pair', title: 'Currencies', singular: 'currency pair', reorderable: true },
  country: { category: 'country', title: 'Countries', singular: 'country', reorderable: true },
  container: { category: 'container', title: 'Containers', singular: 'container', reorderable: false },
  shipping_line: { category: 'shipping_line', title: 'Shipping Lines', singular: 'shipping line', reorderable: true },
  sea_port: { category: 'sea_port', title: 'Sea Ports', singular: 'sea port', reorderable: true },
};
