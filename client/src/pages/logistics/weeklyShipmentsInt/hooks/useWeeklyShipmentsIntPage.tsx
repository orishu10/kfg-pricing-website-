import { useState } from 'react';
import { weekStart } from '../../utils/week';
import type { WeeklyShipment } from '../../../../api';

export const useWeeklyShipmentsIntPage = () => {
  const [monday, setMonday] = useState(() => weekStart(new Date()));
  const [search, setSearch] = useState('');
  const rows: WeeklyShipment[] = [];

  return { rows, monday, setMonday, search, setSearch };
};
