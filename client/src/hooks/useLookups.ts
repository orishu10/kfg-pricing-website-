import { useQuery } from '@tanstack/react-query';
import { getLookups, type LookupCategory, type LookupGroups } from '../api';

const EMPTY_GROUPS: LookupGroups = {
  incoterms: [],
  currency_pair: [],
  country: [],
  container: [],
  shipping_line: [],
  sea_port: [],
};

export const useLookups = () => {
  const { data } = useQuery({ queryKey: ['lookups'], queryFn: getLookups });
  const groups = data ?? EMPTY_GROUPS;

  const options = (category: LookupCategory, current?: string | null) => {
    const list = groups[category].map((option) => option.value);
    return current && !list.includes(current) ? [current, ...list] : list;
  };

  return { groups, options };
};
