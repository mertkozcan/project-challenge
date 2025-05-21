import type { NavigationTree } from '@/@types/navigation';
import {
  IconDashboard,
  IconTrophy,
  IconTarget,
  IconDice5,
  IconListCheck,
  IconChartBar,
} from '@tabler/icons-react';

const navigationConfig: NavigationTree[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    translateKey: '',
    icon: IconDashboard,
    authority: ['user'],
    subMenu: [],
  },
  {
    key: 'challenges',
    path: '/challenges',
    title: 'Challenges',
    translateKey: '',
    icon: IconTarget,
    authority: ['user'],
    subMenu: [],
  },
  {
    key: 'build-challenges',
    path: '/build-challenges',
    title: 'Build Challenges',
    translateKey: '',
    icon: IconListCheck,
    authority: ['user'],
    subMenu: [],
  },
  {
    key: 'bingo-challenges',
    path: '/bingo-challenges',
    title: 'Bingo Challenges',
    translateKey: '',
    icon: IconDice5,
    authority: ['user'],
    subMenu: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    title: 'Leaderboard',
    translateKey: '',
    icon: IconChartBar,
    authority: ['user'],
    subMenu: [],
  },
];

export default navigationConfig;
