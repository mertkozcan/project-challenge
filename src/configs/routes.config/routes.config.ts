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
    key: 'create-challenge',
    path: '/challenges/create',
    component: lazy(() => import('@/pages/challenges/CreateChallenge')),
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
    key: 'builds',
    path: '/builds',
    component: lazy(() => import('@/pages/builds/Builds')),
    authority: [],
  },
  {
    key: 'create-build',
    path: '/builds/create',
    component: lazy(() => import('@/pages/builds/CreateBuild')),
    authority: [],
  },
  {
    key: 'builds.detail',
    path: '/builds/:id',
    component: lazy(() => import('@/pages/builds/BuildDetail')),
    authority: [],
  },
  {
    key: 'bingo-board',
    path: '/bingo/:id',
    component: lazy(() => import('@/pages/challenges/BingoBoard')),
    authority: [],
  },
  {
    key: 'profile',
    path: '/profile/:id',
    component: lazy(() => import('@/pages/profile/UserProfile')),
    authority: [],
  },
  {
    key: 'admin',
    path: '/admin',
    component: lazy(() => import('@/pages/admin/AdminPanel')),
    authority: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    component: lazy(() => import('@/pages/leaderboard/index')),
    authority: [],
  },
  {
    key: 'bingo-rooms',
    path: '/bingo/rooms',
    component: lazy(() => import('@/pages/bingo/RoomLobby')),
    authority: [],
  },
  {
    key: 'bingo-waiting-room',
    path: '/bingo/room/:roomId',
    component: lazy(() => import('@/pages/bingo/WaitingRoom')),
    authority: [],
  },
  {
    key: 'bingo-game',
    path: '/bingo/room/:roomId/play',
    component: lazy(() => import('@/pages/bingo/GameView')),
    authority: [],
  },
  {
    key: 'bingo-history',
    path: '/bingo/history',
    component: lazy(() => import('@/pages/bingo/BingoHistory')),
    authority: [],
  },
  {
    key: 'bingo-game-details',
    path: '/bingo/history/:roomId',
    component: lazy(() => import('@/pages/bingo/BingoGameDetails')),
    authority: [],
  },
];
