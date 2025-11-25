import { GameDataProvider, GameItem, ItemCategory } from './gameData.provider';

interface EldenRingApiResponse {
  success: boolean;
  count: number;
  total: number;
  data: any[];
}

export interface EldenRingClass {
  id: string;
  name: string;
  image: string;
  description: string;
  stats: {
    level: string;
    vigor: string;
    mind: string;
    endurance: string;
    strength: string;
    dexterity: string;
    intelligence: string;
    faith: string;
    arcane: string;
  };
}

export class EldenRingProvider implements GameDataProvider {
  gameName = 'Elden Ring';
  private baseUrl = 'https://eldenring.fanapis.com/api';

  private categoryMap: Record<ItemCategory, string> = {
    weapons: 'weapons',
    armors: 'armors',
    talismans: 'talismans',
    sorceries: 'sorceries',
    incantations: 'incantations',
    shields: 'shields',
    ashes: 'ashes',
    consumables: 'items', // Items API filtered by type
    classes: 'classes',
    spirits: 'spirits',
    ammos: 'ammos',
    greatRunes: 'items', // Search in general items
    crystalTears: 'items',
  };

  async getClasses(): Promise<EldenRingClass[]> {
    try {
      const url = `${this.baseUrl}/classes?limit=100`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Elden Ring API error: ${response.statusText}`);
      }

      const json: EldenRingApiResponse = await response.json();
      
      if (!json.success || !json.data) {
        return [];
      }

      // Filter out Network Test classes and duplicates
      const excludedClasses = ['Enchanted Knight', 'Bloody Wolf', 'Champion'];
      const uniqueClasses = new Map();

      json.data.forEach((cls: any) => {
        if (!excludedClasses.includes(cls.name)) {
          // Use name as key to deduplicate (e.g. Warrior appears twice)
          if (!uniqueClasses.has(cls.name)) {
            uniqueClasses.set(cls.name, {
              id: cls.id,
              name: cls.name,
              image: cls.image,
              description: cls.description,
              stats: cls.stats
            });
          }
        }
      });

      return Array.from(uniqueClasses.values());
    } catch (error) {
      console.error('Failed to fetch Elden Ring classes:', error);
      return [];
    }
  }

  async searchItems(query: string, category?: ItemCategory): Promise<GameItem[]> {
    try {
      let endpoint = '/items'; // Default search all items if no category
      if (category && this.categoryMap[category]) {
        endpoint = `/${this.categoryMap[category]}`;
      }

      // Special handling for Crystal Tears initial load
      // The API doesn't have a dedicated endpoint, so we search for "Tear" if query is empty
      let searchQuery = query;
      if (category === 'crystalTears' && !searchQuery) {
          searchQuery = 'Tear';
      }

      // The API supports ?name=... parameter
      const url = `${this.baseUrl}${endpoint}?name=${encodeURIComponent(searchQuery)}&limit=100`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Elden Ring API error: ${response.statusText}`);
      }

      const json: EldenRingApiResponse = await response.json();
      
      if (!json.success || !json.data) {
        return [];
      }

      let items = json.data;

      // Filter consumables by type if category is consumables
      // Relaxed filter to include more items, or remove if API handles it well
      if (category === 'consumables') {
         // Include Consumable, Tool, and other usable items if needed
         // For now, let's trust the /items endpoint but maybe filter out key items if possible
         // items = items.filter((item: any) => item.type === 'Consumable'); 
      }

      if (category === 'crystalTears') {
        items = items.filter((item: any) => 
          item.name.includes('Crystal Tear') || 
          item.name.includes('Ruptured Tear') || 
          item.name.includes('Cracked Tear') ||
          item.name.includes('Bubbletear')
        );
      }

      return items.map((item: any) => this.mapToGameItem(item, category || 'weapons')); // Fallback category if mixed
    } catch (error) {
      console.error('Failed to search Elden Ring items:', error);
      return [];
    }
  }

  async getItemDetails(itemId: string): Promise<GameItem | null> {
    // Note: The fan API uses ID to fetch specific item details
    // But since we don't know the category from just ID in a generic way without querying all,
    // we might rely on the search or assume we have the object.
    // However, the API has /items/:id endpoint which might work for everything.
    try {
      const url = `${this.baseUrl}/items/${itemId}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const json = await response.json();
      if (!json.success || !json.data) return null;

      return this.mapToGameItem(json.data, 'weapons'); // Category might be loose here
    } catch (error) {
      console.error('Failed to get item details:', error);
      return null;
    }
  }

  private mapToGameItem(apiItem: any, category: ItemCategory): GameItem {
    // Extract relevant stats based on category
    const stats: Record<string, any> = {};
    
    if (apiItem.attack) stats.attack = apiItem.attack;
    if (apiItem.defence) stats.defence = apiItem.defence;
    if (apiItem.scalesWith) stats.scaling = apiItem.scalesWith;
    if (apiItem.requiredAttributes) stats.requirements = apiItem.requiredAttributes;
    if (apiItem.effects) stats.effects = apiItem.effects; // Talismans often have this
    
    // Armor specific
    if (apiItem.dmgNegation) stats.negation = apiItem.dmgNegation;
    if (apiItem.resistance) stats.resistance = apiItem.resistance;
    if (apiItem.weight) stats.weight = apiItem.weight;
    
    // Spells/Incantations specific
    if (apiItem.cost) stats.cost = apiItem.cost;
    if (apiItem.slots) stats.slots = apiItem.slots;

    // Spirit Ashes specific
    if (apiItem.fpCost) stats.fpCost = apiItem.fpCost;
    if (apiItem.hpCost) stats.hpCost = apiItem.hpCost;

    // Some items have 'effect' string instead of array
    if (apiItem.effect) stats.effect = apiItem.effect;

    return {
      id: apiItem.id,
      name: apiItem.name,
      image: apiItem.image,
      description: apiItem.description,
      category: category, 
      stats: stats
    };
  }
}
