import { useQuery } from '@tanstack/react-query';
import { getCustomers, getRoutes, getSchedules, getSuppliers } from '../../../../api';

const withCurrentValue = (values: string[], current?: string | null) =>
  current && !values.includes(current) ? [current, ...values] : values;

export const useShipmentFormOptions = () => {
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: getRoutes });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: getSchedules });

  const customerOptions = (current?: string | null) =>
    withCurrentValue(customers.map((customer) => customer.name), current);

  const supplierOptions = (current?: string | null) =>
    withCurrentValue(suppliers.map((supplier) => supplier.name), current);

  const routeOptions = routes.map((route) => ({
    label: route.reference ? `${route.id} — ${route.reference}` : route.id,
    value: route.id,
  }));

  const scheduleOptions = schedules.map((schedule) => ({
    label: schedule.vessel ? `${schedule.id} — ${schedule.vessel}` : schedule.id,
    value: schedule.id,
  }));

  const findSchedule = (id: string) => schedules.find((schedule) => schedule.id === id);

  return { customerOptions, supplierOptions, routeOptions, scheduleOptions, findSchedule };
};
