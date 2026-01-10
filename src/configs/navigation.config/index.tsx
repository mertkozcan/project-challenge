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
  IconGridDots,
} from '@tabler/icons-react';

const navigationConfig: NavigationTree[] = [
  {
    key: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    translateKey: 'nav.dashboard',
    icon: IconDashboard,
    authority: [],
    subMenu: [],
  },
  {
    key: 'challenges',
    path: '/challenges',
    title: 'Challenges',
    translateKey: 'nav.challenges',
    icon: IconTarget,
    authority: [],
    subMenu: [],
  },
  {
    key: 'builds',
    path: '/builds',
    title: 'Builds',
    translateKey: 'nav.builds',
    icon: IconSword,
    authority: [],
    subMenu: [],
  },
  {
    key: 'bingo-challenges',
    path: '/bingo-challenges',
    title: 'Bingo Challenges',
    translateKey: 'nav.bingoChallenges',
    icon: IconGridDots,
    authority: [],
    subMenu: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    title: 'Leaderboard',
    translateKey: 'nav.leaderboard',
    icon: IconTrophy,
    authority: [],
    subMenu: [],
  },


  {
    key: 'admin',
    path: '/admin',
    title: 'Admin Panel',
    translateKey: 'nav.admin',
    icon: IconSettings,
    authority: ['admin'],
    subMenu: [],
  },
];

export default navigationConfig;
