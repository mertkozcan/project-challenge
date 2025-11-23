import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Grid, Card, Image, Text, Tabs, Loader, Center, Group, Badge, ActionIcon, ScrollArea } from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
import { GameDataFactory } from '@/services/games/gameData.factory';
import { GameItem, ItemCategory } from '@/services/games/gameData.provider';
import { useDebouncedValue } from '@mantine/hooks';

interface ItemSearchModalProps {
  opened: boolean;
  onClose: () => void;
  gameName: string;
  onSelect: (item: GameItem) => void;
  initialCategory?: ItemCategory;
}

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'weapons', label: 'Weapons' },
  { value: 'armors', label: 'Armor' },
  { value: 'talismans', label: 'Talismans' },
  { value: 'sorceries', label: 'Sorceries' },
  { value: 'incantations', label: 'Incantations' },
  { value: 'shields', label: 'Shields' },
  { value: 'ashes', label: 'Ashes of War' },
];

const ItemSearchModal: React.FC<ItemSearchModalProps> = ({ opened, onClose, gameName, onSelect, initialCategory = 'weapons' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 500);
  const [activeCategory, setActiveCategory] = useState<ItemCategory>(initialCategory);
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      handleSearch();
    }
  }, [opened, debouncedQuery, activeCategory]);

  const handleSearch = async () => {
    const provider = GameDataFactory.getProvider(gameName);
    if (!provider) return;

    setLoading(true);
    try {
      const results = await provider.searchItems(debouncedQuery, activeCategory);
      setItems(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Select ${activeCategory}`} size="xl" scrollAreaComponent={ScrollArea.Autosize}>
      <TextInput
        placeholder="Search items..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="md"
        autoFocus
      />

      <Tabs value={activeCategory} onChange={(val) => setActiveCategory(val as ItemCategory)} mb="md">
        <Tabs.List>
          {CATEGORIES.map(cat => (
            <Tabs.Tab key={cat.value} value={cat.value}>{cat.label}</Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {loading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Grid>
          {items.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
              <Card 
                shadow="sm" 
                padding="xs" 
                radius="md" 
                withBorder 
                style={{ cursor: 'pointer', height: '100%' }}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Card.Section>
                  <Center bg="dark.7" p="xs" h={120}>
                    {item.image ? (
                      <Image src={item.image} h={100} w="auto" fit="contain" fallbackSrc="https://placehold.co/100x100?text=No+Image" />
                    ) : (
                      <IconPlus size={40} color="gray" />
                    )}
                  </Center>
                </Card.Section>
                
                <Text fw={500} size="sm" mt="xs" lineClamp={2}>{item.name}</Text>
                
                {item.stats?.attack && (
                   <Group gap={4} mt={4}>
                     {item.stats.attack.map((att: any, index: number) => (
                       att.amount > 0 && <Badge key={index} size="xs" variant="outline">{att.name}: {att.amount}</Badge>
                     ))}
                   </Group>
                )}
              </Card>
            </Grid.Col>
          ))}
          {!loading && items.length === 0 && (
            <Center w="100%" h={100}>
              <Text c="dimmed">No items found.</Text>
            </Center>
          )}
        </Grid>
      )}
    </Modal>
  );
};

export default ItemSearchModal;
