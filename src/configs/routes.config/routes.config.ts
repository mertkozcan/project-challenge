import { lazy } from 'react';
import authRoute from './authRoute';
import type { Routes } from '@/@types/routes';

export const publicRoutes: Routes = [...authRoute];

export const protectedRoutes = [
  {
    key: 'dashboard',
    path: '/dashboard',
    component: lazy(() => import('@/pages/examples/Dashboard')),
    authority: [],
  },
  {
    key: 'challenges',
    path: '/challenges',
    component: lazy(() => import('@/pages/challenges/Challenges')),
    authority: [],
  },
  {
    key: 'challenge-details',
    path: '/challenges/:id',
    component: lazy(() => import('@/components/Challenge/Challenge')),
    authority: [],
  },
  {
    key: 'build-challenges',
    path: '/build-challenges',
    component: lazy(() => import('@/pages/challenges/BuildChallenges')),
    authority: [],
  },
  {
    key: 'bingo-challenges',
    path: '/bingo-challenges',
    component: lazy(() => import('@/pages/challenges/BingoChallenges')),
    authority: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    component: lazy(() => import('@/pages/leaderboard')),
    authority: [],
  },
];
