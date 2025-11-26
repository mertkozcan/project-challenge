import { lazy } from 'react';
import authRoute from './authRoute';
import type { Routes } from '@/@types/routes';

export const publicRoutes: Routes = [
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
    key: 'builds',
    path: '/builds',
    component: lazy(() => import('@/pages/builds/Builds')),
    authority: [],
  },
  {
    key: 'builds.detail',
    path: '/builds/:id',
    component: lazy(() => import('@/pages/builds/BuildDetail')),
    authority: [],
  },
  {
    key: 'leaderboard',
    path: '/leaderboard',
    component: lazy(() => import('@/pages/leaderboard/index')),
    authority: [],
  },
  {
    key: 'admin',
    path: '/admin',
    component: lazy(() => import('@/pages/admin/AdminPanel')),
    authority: ['admin'],
  },
  {
    key: 'bingo-history',
    path: '/bingo/history',
    component: lazy(() => import('@/pages/bingo/BingoHistory')),
    authority: [],
  },
  {
    key: 'bingo-history-detail',
    path: '/bingo/history/:roomId',
    component: lazy(() => import('@/pages/bingo/BingoGameDetails')),
    authority: [],
  },
  {
    key: 'bingo-challenges',
    path: '/bingo-challenges',
    component: lazy(() => import('@/pages/challenges/BingoChallenges')),
    authority: [],
  },
  {
    key: 'bingo-rooms',
    path: '/bingo/rooms',
    component: lazy(() => import('@/pages/bingo/RoomLobby')),
    authority: [],
  },
  {
    key: 'bingo-board',
    path: '/bingo/:id',
    component: lazy(() => import('@/pages/challenges/BingoBoard')),
    authority: [],
  },
  {
    key: 'bingo-history',
    path: '/bingo/history',
    component: lazy(() => import('@/pages/bingo/BingoHistory')),
    authority: [],
  },
  {
    key: 'bingo-history-detail',
    path: '/bingo/history/:roomId',
    component: lazy(() => import('@/pages/bingo/BingoGameDetails')),
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
    key: '404',
    path: '/404',
    component: lazy(() => import('@/pages/NotFound')),
    authority: [],
  },
];

export const protectedRoutes = [
  {
    key: 'create-challenge',
    path: '/challenges/create',
    component: lazy(() => import('@/pages/challenges/CreateChallenge')),
    authority: [],
  },
  {
    key: 'edit-challenge',
    path: '/challenges/edit/:id',
    component: lazy(() => import('@/pages/challenges/CreateChallenge')),
    authority: [],
  },
  {
    key: 'create-build',
    path: '/builds/create',
    component: lazy(() => import('@/pages/builds/CreateBuild')),
    authority: [],
  },
  {
    key: 'edit-build',
    path: '/builds/edit/:id',
    component: lazy(() => import('@/pages/builds/CreateBuild')),
    authority: [],
  },
  {
    key: 'profile',
    path: '/profile/:username',
    component: lazy(() => import('@/pages/profile/UserProfile')),
    authority: [],
  },
  {
    key: 'proof-upload',
    path: '/proofs/upload',
    component: lazy(() => import('@/pages/proofs/ProofUpload')),
    authority: [],
  },
  {
    key: 'proof-review',
    path: '/proofs/review',
    component: lazy(() => import('@/pages/proofs/ProofReview')),
    authority: [],
  },
  {
    key: 'create-bingo',
    path: '/bingo/create',
    component: lazy(() => import('@/pages/bingo/CreateBingo')),
    authority: [],
  },
  {
    key: 'edit-bingo',
    path: '/bingo/edit/:id',
    component: lazy(() => import('@/pages/bingo/CreateBingo')),
    authority: [],
  },
];
