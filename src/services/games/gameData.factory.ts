import { GameDataProvider } from './gameData.provider';
import { EldenRingProvider } from './eldenRing.provider';

export class GameDataFactory {
  private static providers: Record<string, GameDataProvider> = {
    'Elden Ring': new EldenRingProvider(),
    // Add other games here in the future
  };

  static getProvider(gameName: string): GameDataProvider | null {
    return this.providers[gameName] || null;
  }
}
