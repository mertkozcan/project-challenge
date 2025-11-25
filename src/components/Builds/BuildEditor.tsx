import { useState } from 'react';
import { Stack, Title, Paper, SimpleGrid, Divider, Button, Group, Tabs, Text } from '@mantine/core';
import { IconUser, IconSword, IconSparkles } from '@tabler/icons-react';
import { GameItem } from '@/services/games/gameData.provider';
import ItemSlot from './ItemSlot';
import MultiItemSelect from './MultiItemSelect';
import ItemSearchModal from './ItemSearchModal';
import StatsInput, { CharacterStats } from './StatsInput';
import { getGameTheme } from '@/utils/gameThemes';

export interface BuildSlots {
  // Character
  stats: CharacterStats;
  startingClass?: GameItem | null;
  greatRune?: GameItem | null;

  // Weapons
  rightHand1?: GameItem | null;
  rightHand1Ash?: GameItem | null;
  rightHand2?: GameItem | null;
  rightHand2Ash?: GameItem | null;
  rightHand3?: GameItem | null;
  rightHand3Ash?: GameItem | null;
  leftHand1?: GameItem | null;
  leftHand1Ash?: GameItem | null;
  leftHand2?: GameItem | null;
  leftHand2Ash?: GameItem | null;
  leftHand3?: GameItem | null;
  leftHand3Ash?: GameItem | null;
  
  // Armor
  head?: GameItem | null;
  chest?: GameItem | null;
  arms?: GameItem | null;
  legs?: GameItem | null;
  
  // Talismans
  talisman1?: GameItem | null;
  talisman2?: GameItem | null;
  talisman3?: GameItem | null;
  talisman4?: GameItem | null;
  
  // Spells & Incantations
  spells: GameItem[];
  incantations: GameItem[];
  
  // Spirit Ashes
  spiritAsh?: GameItem | null;

  // Flask of Wondrous Physick
  physick1?: GameItem | null;
  physick2?: GameItem | null;

  // Consumables (multiple)
  consumables: GameItem[];

  // Ammo
  ammo1?: GameItem | null;
  ammo2?: GameItem | null;
}

interface BuildEditorProps {
  gameName: string;
  initialSlots?: BuildSlots;
  onSave: (slots: BuildSlots) => void;
  onCancel?: () => void;
}

const BuildEditor = ({ gameName, initialSlots, onSave, onCancel }: BuildEditorProps) => {
  const theme = getGameTheme(gameName);
  const [activeTab, setActiveTab] = useState<string | null>('character');
  
  const defaultStats: CharacterStats = {
    level: 1,
    vigor: 10,
    mind: 10,
    endurance: 10,
    strength: 10,
    dexterity: 10,
    intelligence: 10,
    faith: 10,
    arcane: 10,
  };

  const [slots, setSlots] = useState<BuildSlots>(initialSlots || {
    stats: defaultStats,
    spells: [],
    incantations: [],
    consumables: [],
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<{
    key: keyof BuildSlots;
    category: any;
    isMulti?: boolean;
  } | null>(null);

  const openModal = (slotKey: keyof BuildSlots, category: any, isMulti = false) => {
    setCurrentSlot({ key: slotKey, category, isMulti });
    setModalOpen(true);
  };

  const handleItemSelect = (item: GameItem) => {
    if (!currentSlot) return;

    if (currentSlot.isMulti) {
      // For multi-select (spells/incantations/consumables)
      const key = currentSlot.key as 'spells' | 'incantations' | 'consumables';
      setSlots(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), item],
      }));
    } else {
      // For single slots
      setSlots(prev => ({
        ...prev,
        [currentSlot.key]: item,
      }));
    }
  };

  const clearSlot = (slotKey: keyof BuildSlots) => {
    setSlots(prev => ({
      ...prev,
      [slotKey]: null,
    }));
  };

  const removeMultiItem = (key: 'spells' | 'incantations' | 'consumables', index: number) => {
    setSlots(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleStatsChange = (newStats: CharacterStats) => {
    setSlots(prev => ({
      ...prev,
      stats: newStats,
    }));
  };

  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{
        background: 'linear-gradient(145deg, rgba(30, 30, 46, 0.95), rgba(21, 21, 21, 0.95))',
        border: `1px solid ${theme.primary}20`,
      }}
    >
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={3} c={theme.primary}>Build Editor</Title>
          <Group>
             {onCancel && (
              <Button variant="subtle" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              style={{ background: theme.gradient }}
              onClick={() => onSave(slots)}
            >
              Save Build
            </Button>
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="character" leftSection={<IconUser size={16} />}>
              Character
            </Tabs.Tab>
            <Tabs.Tab value="equipment" leftSection={<IconSword size={16} />}>
              Equipment
            </Tabs.Tab>
            <Tabs.Tab value="magic" leftSection={<IconSparkles size={16} />}>
              Magic & Items
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="character">
            <Stack gap="xl">
              <Title order={4} c={theme.primary}>Attributes</Title>
              <StatsInput stats={slots.stats} onChange={handleStatsChange} theme={theme} />
              
              <Divider />
              
              <Title order={4} c={theme.primary}>Class & Origin</Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <ItemSlot
                  label="Starting Class"
                  item={slots.startingClass}
                  onSelect={() => openModal('startingClass', 'classes')}
                  onClear={() => clearSlot('startingClass')}
                  theme={theme}
                />
                <ItemSlot
                  label="Great Rune"
                  item={slots.greatRune}
                  onSelect={() => openModal('greatRune', 'items')} // Great Runes might be under items
                  onClear={() => clearSlot('greatRune')}
                  theme={theme}
                />
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="equipment">
            <Stack gap="xl">
              {/* Weapons Section */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Weapons</Title>
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                  <ItemSlot
                    label="Right Hand 1"
                    item={slots.rightHand1}
                    onSelect={() => openModal('rightHand1', 'weapons')}
                    onClear={() => clearSlot('rightHand1')}
                    secondaryItem={slots.rightHand1Ash}
                    onSecondarySelect={() => openModal('rightHand1Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('rightHand1Ash')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Right Hand 2"
                    item={slots.rightHand2}
                    onSelect={() => openModal('rightHand2', 'weapons')}
                    onClear={() => clearSlot('rightHand2')}
                    secondaryItem={slots.rightHand2Ash}
                    onSecondarySelect={() => openModal('rightHand2Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('rightHand2Ash')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Right Hand 3"
                    item={slots.rightHand3}
                    onSelect={() => openModal('rightHand3', 'weapons')}
                    onClear={() => clearSlot('rightHand3')}
                    secondaryItem={slots.rightHand3Ash}
                    onSecondarySelect={() => openModal('rightHand3Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('rightHand3Ash')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Left Hand 1"
                    item={slots.leftHand1}
                    onSelect={() => openModal('leftHand1', 'weapons')}
                    onClear={() => clearSlot('leftHand1')}
                    secondaryItem={slots.leftHand1Ash}
                    onSecondarySelect={() => openModal('leftHand1Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('leftHand1Ash')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Left Hand 2"
                    item={slots.leftHand2}
                    onSelect={() => openModal('leftHand2', 'weapons')}
                    onClear={() => clearSlot('leftHand2')}
                    secondaryItem={slots.leftHand2Ash}
                    onSecondarySelect={() => openModal('leftHand2Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('leftHand2Ash')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Left Hand 3"
                    item={slots.leftHand3}
                    onSelect={() => openModal('leftHand3', 'weapons')}
                    onClear={() => clearSlot('leftHand3')}
                    secondaryItem={slots.leftHand3Ash}
                    onSecondarySelect={() => openModal('leftHand3Ash', 'ashes')}
                    onSecondaryClear={() => clearSlot('leftHand3Ash')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>

              <Divider />

              {/* Armor Section */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Armor</Title>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <ItemSlot
                    label="Head"
                    item={slots.head}
                    onSelect={() => openModal('head', 'armors')}
                    onClear={() => clearSlot('head')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Chest"
                    item={slots.chest}
                    onSelect={() => openModal('chest', 'armors')}
                    onClear={() => clearSlot('chest')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Arms"
                    item={slots.arms}
                    onSelect={() => openModal('arms', 'armors')}
                    onClear={() => clearSlot('arms')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Legs"
                    item={slots.legs}
                    onSelect={() => openModal('legs', 'armors')}
                    onClear={() => clearSlot('legs')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>

              <Divider />

              {/* Talismans Section */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Talismans</Title>
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <ItemSlot
                    label="Talisman 1"
                    item={slots.talisman1}
                    onSelect={() => openModal('talisman1', 'talismans')}
                    onClear={() => clearSlot('talisman1')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Talisman 2"
                    item={slots.talisman2}
                    onSelect={() => openModal('talisman2', 'talismans')}
                    onClear={() => clearSlot('talisman2')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Talisman 3"
                    item={slots.talisman3}
                    onSelect={() => openModal('talisman3', 'talismans')}
                    onClear={() => clearSlot('talisman3')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Talisman 4"
                    item={slots.talisman4}
                    onSelect={() => openModal('talisman4', 'talismans')}
                    onClear={() => clearSlot('talisman4')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="magic">
            <Stack gap="xl">
              {/* Spells & Incantations */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Magic</Title>
                <MultiItemSelect
                  label="Sorceries"
                  items={slots.spells}
                  onAdd={() => openModal('spells', 'sorceries', true)}
                  onRemove={(index) => removeMultiItem('spells', index)}
                  theme={theme}
                  maxItems={10}
                />
                <MultiItemSelect
                  label="Incantations"
                  items={slots.incantations}
                  onAdd={() => openModal('incantations', 'incantations', true)}
                  onRemove={(index) => removeMultiItem('incantations', index)}
                  theme={theme}
                  maxItems={10}
                />
              </Stack>

              <Divider />

              {/* Spirit Ashes */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Spirit Ashes</Title>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                   <ItemSlot
                    label="Spirit Ash"
                    item={slots.spiritAsh}
                    onSelect={() => openModal('spiritAsh', 'spirits')}
                    onClear={() => clearSlot('spiritAsh')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>

              <Divider />

              {/* Flask of Wondrous Physick */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Flask of Wondrous Physick</Title>
                <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="md">
                  <ItemSlot
                    label="Crystal Tear 1"
                    item={slots.physick1}
                    onSelect={() => openModal('physick1', 'consumables')}
                    onClear={() => clearSlot('physick1')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Crystal Tear 2"
                    item={slots.physick2}
                    onSelect={() => openModal('physick2', 'consumables')}
                    onClear={() => clearSlot('physick2')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>

              <Divider />

              {/* Consumables & Ammo */}
              <Stack gap="md">
                <Title order={4} c={theme.primary}>Items & Ammo</Title>
                <MultiItemSelect
                  label="Consumables"
                  items={slots.consumables}
                  onAdd={() => openModal('consumables', 'consumables', true)}
                  onRemove={(index) => removeMultiItem('consumables', index)}
                  theme={theme}
                  maxItems={10}
                />
                
                <Text size="sm" fw={600} c="dimmed" mt="md">AMMO</Text>
                <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="md">
                  <ItemSlot
                    label="Ammo 1"
                    item={slots.ammo1}
                    onSelect={() => openModal('ammo1', 'ammos')}
                    onClear={() => clearSlot('ammo1')}
                    theme={theme}
                  />
                  <ItemSlot
                    label="Ammo 2"
                    item={slots.ammo2}
                    onSelect={() => openModal('ammo2', 'ammos')}
                    onClear={() => clearSlot('ammo2')}
                    theme={theme}
                  />
                </SimpleGrid>
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Action Buttons (Bottom) */}
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="subtle" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            style={{ background: theme.gradient }}
            onClick={() => onSave(slots)}
          >
            Save Build
          </Button>
        </Group>
      </Stack>

      {/* Item Search Modal */}
      {currentSlot && (
        <ItemSearchModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          category={currentSlot.category}
          onSelect={handleItemSelect}
          theme={theme}
        />
      )}
    </Paper>
  );
};

export default BuildEditor;
