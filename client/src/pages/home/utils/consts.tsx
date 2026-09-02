import StorageIcon from '@mui/icons-material/Storage';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import pmsLogo from '../../../../public/Icon PMS.svg';
import pricingLogo from '../../../../public/Icon PRICING.svg';
import type { AccessRequirement } from '../../../context/auth';

export interface HomeModuleCard {
  requires: AccessRequirement;
  label: string;
  path: string;
  icon: string | React.ReactNode;
  ready: boolean;
}

export const HOME_MODULE_CARDS: HomeModuleCard[] = [
  { requires: 'dbm', label: 'DBM', path: '/dbm', icon: <StorageIcon sx={{ fontSize: 56 }} />, ready: true },
  { requires: 'pricing', label: 'Pricing', path: '/pricing', icon: pricingLogo, ready: true },
  { requires: 'logistics', label: 'Logistics', path: '/logistics', icon: pmsLogo, ready: true },
  { requires: 'reports', label: 'Reports', path: '/reports', icon: <AssessmentIcon sx={{ fontSize: 56 }} />, ready: false },
  { requires: 'admin', label: 'Users', path: '/users', icon: <ManageAccountsIcon sx={{ fontSize: 56 }} />, ready: true },
  { requires: 'admin', label: 'Formats', path: '/formats', icon: <DashboardCustomizeIcon sx={{ fontSize: 56 }} />, ready: true },
];
