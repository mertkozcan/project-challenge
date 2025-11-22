import { Step } from 'react-joyride';

// Dashboard Tour Steps
export const dashboardTourSteps: Step[] = [
  {
    target: 'body',
    content: '👋 Welcome to the Bingo Challenge Platform! Let me show you around in just a few steps.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.mantine-AppShell-navbar',
    content: '📍 Use this sidebar to navigate between different sections: Dashboard, Challenges, Leaderboard, and more!',
    placement: 'right',
  },
  {
    target: '[href="/challenges"]',
    content: '🎮 Browse and play various bingo and build challenges here. This is where the fun begins!',
    placement: 'right',
  },
  {
    target: '[href="/leaderboard"]',
    content: '🏆 Check the leaderboard to see how you rank against other players. Compete for the top spot!',
    placement: 'right',
  },
  {
    target: 'body',
    content: '✨ That\'s it! You\'re ready to start playing. Click on any challenge to begin. Good luck!',
    placement: 'center',
  },
];

// Bingo Board Tour Steps
export const bingoTourSteps: Step[] = [
  {
    target: 'body',
    content: '🎯 Welcome to Bingo! Let me explain how to play and win.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.bingo-grid',
    content: '📋 This is your bingo board. Each cell contains a challenge task you need to complete.',
    placement: 'top',
    disableOverlayClose: true,
  },
  {
    target: '.bingo-cell:first-child',
    content: '✅ Click on a cell to mark it as completed. Make sure you\'ve actually done the task before marking it!',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: '🎊 Win by completing a full row, column, or diagonal. The first to complete wins!',
    placement: 'center',
  },
  {
    target: 'body',
    content: '⏱️ Pro tip: Complete tasks faster to climb the leaderboard. Time matters!',
    placement: 'center',
  },
];

// Multiplayer Tour Steps
export const multiplayerTourSteps: Step[] = [
  {
    target: 'body',
    content: '👥 Welcome to Multiplayer Bingo! Compete with friends in real-time.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: '🎮 Create a room or join an existing one to start playing with others.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ Mark yourself as ready when you\'re prepared. The game starts when all players are ready!',
    placement: 'center',
  },
  {
    target: 'body',
    content: '🏁 First player to complete a row, column, or diagonal wins. May the best player win!',
    placement: 'center',
  },
];

// Challenges Tour Steps
export const challengesTourSteps: Step[] = [
  {
    target: 'body',
    content: '🎯 Explore different challenge types and earn rewards!',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: 'body',
    content: '🎮 Choose from Bingo challenges, Build challenges, and more. Each has unique rewards!',
    placement: 'center',
  },
  {
    target: 'body',
    content: '⭐ Complete challenges to earn points, climb the leaderboard, and unlock achievements!',
    placement: 'center',
  },
];

export type TourType = 'dashboard' | 'bingo' | 'multiplayer' | 'challenges';

export const tourStepsMap: Record<TourType, Step[]> = {
  dashboard: dashboardTourSteps,
  bingo: bingoTourSteps,
  multiplayer: multiplayerTourSteps,
  challenges: challengesTourSteps,
};
