import { useState, useEffect } from 'react';
import { Modal, TextInput, Stack, ScrollArea, Card, Group, Text, Image, LoadingOverlay, Box, SimpleGrid, Divider } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { GameItem, ItemCategory } from '@/services/games/gameData.provider';
import { EldenRingProvider } from '@/services/games/eldenRing.provider';
import ItemTooltip from './ItemTooltip';

interface ItemSearchModalProps {
  opened: boolean;
  onClose: () => void;
  category: ItemCategory;
  onSelect: (item: GameItem) => void;
  theme?: any;
  filter?: string; // Optional filter for sub-categories (e.g. Helm, Chest Armor)
}

const ItemSearchModal = ({ opened, onClose, category, onSelect, theme, filter }: ItemSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const provider = new EldenRingProvider();
  const primaryColor = theme?.primary || '#228be6';

  useEffect(() => {
    if (opened) {
      setQuery('');
      setItems([]);
      // Load initial items
      searchItems('');
    }
  }, [opened, category]);

  const searchItems = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await provider.searchItems(searchQuery || '', category);
      
      // Apply client-side filtering if filter prop is provided
      let filteredResults = results;
      if (filter) {
          filteredResults = results.filter(item => 
              item.stats?.category === filter || 
              item.category === filter // Fallback if category is top-level
          );
      }
      
      setItems(filteredResults);
    } catch (error) {
      console.error('Failed to search items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GameItem) => {
    onSelect(item);
    onClose();
  };

  const getCategoryLabel = (cat: ItemCategory): string => {
    const labels: Record<ItemCategory, string> = {
      weapons: 'Weapons',
      armors: 'Armor',
      talismans: 'Talismans',
      sorceries: 'Sorceries',
      incantations: 'Incantations',
      shields: 'Shields',
      ashes: 'Ashes of War',
      consumables: 'Consumables',
      classes: 'Starting Classes',
      spirits: 'Spirit Ashes',
      ammos: 'Ammo',
      greatRunes: 'Great Runes',
      crystalTears: 'Crystal Tears',
    };
    return labels[cat];
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Select ${getCategoryLabel(category)}`}
      size="xl"
      styles={{
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: primaryColor,
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          placeholder={`Search ${getCategoryLabel(category).toLowerCase()}...`}
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          autoFocus
        />

        <ScrollArea h={600} style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          {items.length > 0 ? (
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
              {items.map((item) => (
                <ItemTooltip
                  key={item.id}
                  itemName={item.name}
                  description={item.description}
                  stats={item.stats}
                  theme={theme}
                >
                  <Card
                    padding="md"
                    radius="md"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = `1px solid ${primaryColor}`;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${primaryColor}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Box 
                      mb="sm" 
                      style={{ 
                        width: 80, 
                        height: 80, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          fit="contain"
                        />
                      ) : (
                        <Box 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '50%' 
                          }} 
                        />
                      )}
                    </Box>
                    
                    <Text 
                      fw={600} 
                      c={primaryColor} 
                      ta="center" 
                      size="sm"
                      lineClamp={2}
                      style={{ width: '100%' }}
                    >
                      {item.name}
                    </Text>

                    {/* Stats for Sorceries/Incantations/Spirits */}
                    {(item.stats?.cost || item.stats?.fpCost || item.stats?.requirements) && (
                        <Stack gap={2} mt="xs" w="100%">
                            <Divider color="rgba(255,255,255,0.1)" />
                            
                            {/* FP Cost */}
                            {(item.stats?.cost || item.stats?.fpCost) && (
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">FP</Text>
                                    <Text size="xs" c="blue.3">{item.stats?.cost || item.stats?.fpCost}</Text>
                                </Group>
                            )}

                            {/* HP Cost (Spirits) */}
                            {item.stats?.hpCost && item.stats.hpCost !== "0" && (
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">HP</Text>
                                    <Text size="xs" c="red.3">{item.stats.hpCost}</Text>
                                </Group>
                            )}

                            {/* Slots */}
                            {item.stats?.slots && (
                                <Group justify="space-between">
                                    <Text size="xs" c="dimmed">Slots</Text>
                                    <Text size="xs">{item.stats.slots}</Text>
                                </Group>
                            )}

                            {/* Requirements */}
                            {item.stats?.requirements && (
                                <Group gap={4} justify="center" mt={2}>
                                    {item.stats.requirements
                                        .filter((r: any) => r.amount > 0 || r.value > 0) // Filter out 0 requirements
                                        .map((r: any, i: number) => (
                                        <Text key={i} size="xs" c="dimmed" style={{ fontSize: 10 }}>
                                            {r.name.substring(0,3)} {r.amount || r.value}
                                        </Text>
                                    ))}
                                </Group>
                            )}
                        </Stack>
                    )}
                  </Card>
                </ItemTooltip>
              ))}
            </SimpleGrid>
          ) : (
            <Box ta="center" py="xl">
              <Text c="dimmed">
                {query ? 'No items found' : `Start typing to search ${getCategoryLabel(category).toLowerCase()}`}
              </Text>
            </Box>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
};

export default ItemSearchModal;
