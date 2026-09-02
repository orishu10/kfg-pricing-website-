import type { LookupCategory } from '../../../api';

export interface ListCategoryConfig {
  category: LookupCategory;
  title: string;
  singular: string;
}

export const LIST_CATEGORIES: Record<LookupCategory, ListCategoryConfig> = {
  incoterms: { category: 'incoterms', title: 'Incoterms', singular: 'incoterm' },
  currency_pair: { category: 'currency_pair', title: 'Currencies', singular: 'currency pair' },
  country: { category: 'country', title: 'Countries', singular: 'country' },
  container: { category: 'container', title: 'Containers', singular: 'container' },
  shipping_line: { category: 'shipping_line', title: 'Shipping Lines', singular: 'shipping line' },
  sea_port: { category: 'sea_port', title: 'Sea Ports', singular: 'sea port' },
};
