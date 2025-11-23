export type ItemCategory = 'weapons' | 'armors' | 'talismans' | 'sorceries' | 'incantations' | 'shields' | 'ashes';

export interface GameItem {
  id: string;
  name: string;
  image: string | null;
  description?: string;
  category: ItemCategory;
  stats?: Record<string, any>;
}

export interface GameDataProvider {
  gameName: string;
  searchItems(query: string, category?: ItemCategory): Promise<GameItem[]>;
  getItemDetails(itemId: string): Promise<GameItem | null>;
}
