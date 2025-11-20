// Game-specific color schemes and theming
export const gameColors: Record<string, {
  primary: string;
  secondary: string;
  gradient: string;
  glow: string;
}> = {
  'Elden Ring': {
    primary: '#FFD700',
    secondary: '#8B4513',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #8B4513 100%)',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
  'Fallout 4': {
    primary: '#00FF00',
    secondary: '#1E3A8A',
    gradient: 'linear-gradient(135deg, #00FF00 0%, #1E3A8A 100%)',
    glow: 'rgba(0, 255, 0, 0.4)',
  },
  'The Elder Scrolls V: Skyrim': {
    primary: '#4169E1',
    secondary: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #4169E1 0%, #C0C0C0 100%)',
    glow: 'rgba(65, 105, 225, 0.4)',
  },
  'Cyberpunk 2077': {
    primary: '#FF00FF',
    secondary: '#00FFFF',
    gradient: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%)',
    glow: 'rgba(255, 0, 255, 0.4)',
  },
  'Dark Souls 3': {
    primary: '#8B0000',
    secondary: '#2F4F4F',
    gradient: 'linear-gradient(135deg, #8B0000 0%, #2F4F4F 100%)',
    glow: 'rgba(139, 0, 0, 0.4)',
  },
};

export const getGameTheme = (gameName: string) => {
  return gameColors[gameName] || {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glow: 'rgba(99, 102, 241, 0.4)',
  };
};
