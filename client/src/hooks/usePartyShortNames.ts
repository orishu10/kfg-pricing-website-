import { useQuery } from '@tanstack/react-query';
import { getCustomers, getSuppliers, type Customer, type Supplier } from '../api';
import { partyLabel } from '../utils/format';

const buildIndex = (parties: (Customer | Supplier)[]) => {
  const index = new Map<string, string>();
  parties.forEach((party) => {
    const label = partyLabel(party.short_name, party.name);
    index.set(party.id.trim().toLowerCase(), label);
    index.set(party.name.trim().toLowerCase(), label);
  });
  return index;
};

const lookup = (index: Map<string, string>) => (value: string | null | undefined) => {
  const raw = (value ?? '').trim();
  return index.get(raw.toLowerCase()) ?? raw;
};

export const usePartyShortNames = () => {
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });

  return {
    customerShortName: lookup(buildIndex(customers)),
    supplierShortName: lookup(buildIndex(suppliers)),
  };
};
