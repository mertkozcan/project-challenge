import type { NavigationTree } from '@/@types/navigation';
import {
  IconDashboard,
  IconTrophy,
  IconTarget,
  IconDice5,
  IconListCheck,
  IconChartBar,
  IconSword,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

const navigationConfig: NavigationTree[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    translateKey: '',
    icon: IconDashboard,
    authority: [],
    subMenu: [],
  },
  {
    key: 'challenges',
    path: '/challenges',
    title: 'Challenges',
    translateKey: '',
    icon: IconTarget,
    authority: [],
    subMenu: [],
  },
  {
    key: 'builds',
    path: '/builds',
    title: 'Builds',
    translateKey: '',
    icon: IconSword,
    authority: [],
    subMenu: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    title: 'Leaderboard',
    translateKey: '',
    icon: IconTrophy,
    authority: [],
    subMenu: [],
  },
  {
    key: 'profile',
    path: '/profile/1',
    title: 'My Profile',
    translateKey: '',
    icon: IconUser,
    authority: [],
    subMenu: [],
  },
  {
    key: 'admin',
    path: '/admin',
    title: 'Admin Panel',
    translateKey: '',
    icon: IconSettings,
    authority: [],
    subMenu: [],
  },
];

export default navigationConfig;
