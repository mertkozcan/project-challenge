import React from 'react';
import { Paper, Title, Text, Grid, Stack, Group, Divider, Box, SimpleGrid, Badge, Image } from '@mantine/core';
import { Build } from '@/@types/build';
import ItemTooltip from './ItemTooltip';

interface EldenRingBuildViewProps {
  build: Build & { items_json: any };
  theme: any;
}

const EldenRingBuildView: React.FC<EldenRingBuildViewProps> = ({ build, theme }) => {
  const items = typeof build.items_json === 'string' 
    ? JSON.parse(build.items_json) 
    : build.items_json || {};

  const stats = items.stats || {};

  // Helper to render an item slot
  const renderItemSlot = (label: string, item: any, ashOfWar?: any) => {
    if (!item) return (
      <Group justify="space-between" p="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Text size="sm" c="dimmed">{label}</Text>
        <Text size="sm" c="dimmed">-</Text>
      </Group>
    );

    return (
      <ItemTooltip itemName={item.name} description={item.description} stats={item.stats} theme={theme}>
        <Box p="xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'help' }}>
          <Group justify="space-between" mb={ashOfWar ? 4 : 0}>
            <Text size="sm" c="dimmed">{label}</Text>
            <Text size="sm" fw={600} c={theme.primary}>{item.name}</Text>
          </Group>
          {ashOfWar && (
            <Group justify="flex-end" gap={4}>
              <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>{ashOfWar.name}</Text>
              <Badge size="xs" variant="outline" color="gray" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>AoW</Badge>
            </Group>
          )}
        </Box>
      </ItemTooltip>
    );
  };

  const StatRow = ({ label, value }: { label: string, value: string | number }) => (
    <Group justify="space-between" p="xs" style={{ background: 'rgba(0,0,0,0.2)', marginBottom: 2 }}>
      <Text size="sm" c="dimmed">{label}</Text>
      <Text size="lg" fw={700} c="white">{value}</Text>
    </Group>
  );

  return (
    <Paper
      p="xl"
      radius="sm"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
        border: '2px solid #4a4a4a',
        boxShadow: '0 0 20px rgba(0,0,0,0.8)',
        color: '#e0e0e0',
        fontFamily: 'serif', // Attempt to match game feel
      }}
    >
      {/* Header Section */}
      <Group justify="space-between" align="flex-start" mb="xl" style={{ borderBottom: '1px solid #cbb26a', paddingBottom: '1rem' }}>
        <Stack gap="xs">
          <Title order={2} style={{ fontFamily: 'serif', color: '#cbb26a', letterSpacing: '1px' }}>
            {build.build_name}
          </Title>
          <Group gap="xl">
            <Text size="md" c="dimmed">Level <span style={{ color: 'white', fontWeight: 'bold' }}>{stats.level || '-'}</span></Text>
            {items.startingClass && <Text size="md" c="dimmed">Class <span style={{ color: 'white', fontWeight: 'bold' }}>{items.startingClass.name}</span></Text>}
          </Group>
        </Stack>
        
        {items.greatRune && (
          <ItemTooltip itemName={items.greatRune.name} description={items.greatRune.description} stats={items.greatRune.stats} theme={theme}>
            <Group gap="xs" style={{ cursor: 'help' }}>
               {items.greatRune.image && (
                 <Image src={items.greatRune.image} w={48} h={48} fit="contain" />
               )}
               <Stack gap={0} align="flex-end">
                 <Text size="xs" c="dimmed" tt="uppercase">Great Rune</Text>
                 <Text size="md" fw={600} c="#cbb26a">{items.greatRune.name}</Text>
               </Stack>
            </Group>
          </ItemTooltip>
        )}
      </Group>

      <Grid gutter={30}>
        {/* Column 1: Attributes */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="xs">
            <Title order={4} style={{ fontFamily: 'serif', color: '#cbb26a', borderBottom: '1px solid rgba(203, 178, 106, 0.3)', paddingBottom: 4 }}>
              Attributes
            </Title>
            <StatRow label="Vigor" value={stats.vigor || '-'} />
            <StatRow label="Mind" value={stats.mind || '-'} />
            <StatRow label="Endurance" value={stats.endurance || '-'} />
            <StatRow label="Strength" value={stats.strength || '-'} />
            <StatRow label="Dexterity" value={stats.dexterity || '-'} />
            <StatRow label="Intelligence" value={stats.intelligence || '-'} />
            <StatRow label="Faith" value={stats.faith || '-'} />
            <StatRow label="Arcane" value={stats.arcane || '-'} />
          </Stack>
        </Grid.Col>

        {/* Column 2: Equipment (Weapons) */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
             <Title order={4} style={{ fontFamily: 'serif', color: '#cbb26a', borderBottom: '1px solid rgba(203, 178, 106, 0.3)', paddingBottom: 4 }}>
              Armament
            </Title>
            <Stack gap={0}>
              {renderItemSlot("Right Hand 1", items.rightHand1, items.rightHand1Ash)}
              {renderItemSlot("Right Hand 2", items.rightHand2, items.rightHand2Ash)}
              {renderItemSlot("Right Hand 3", items.rightHand3, items.rightHand3Ash)}
            </Stack>
            <Stack gap={0} mt="md">
              {renderItemSlot("Left Hand 1", items.leftHand1, items.leftHand1Ash)}
              {renderItemSlot("Left Hand 2", items.leftHand2, items.leftHand2Ash)}
              {renderItemSlot("Left Hand 3", items.leftHand3, items.leftHand3Ash)}
            </Stack>
          </Stack>
        </Grid.Col>

        {/* Column 3: Armor & Talismans */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Title order={4} style={{ fontFamily: 'serif', color: '#cbb26a', borderBottom: '1px solid rgba(203, 178, 106, 0.3)', paddingBottom: 4 }}>
              Armor & Talismans
            </Title>
            <Stack gap={0}>
              {renderItemSlot("Head", items.head)}
              {renderItemSlot("Chest", items.chest)}
              {renderItemSlot("Arms", items.arms)}
              {renderItemSlot("Legs", items.legs)}
            </Stack>
            
            <Stack gap={0} mt="md">
              {renderItemSlot("Talisman 1", items.talisman1)}
              {renderItemSlot("Talisman 2", items.talisman2)}
              {renderItemSlot("Talisman 3", items.talisman3)}
              {renderItemSlot("Talisman 4", items.talisman4)}
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>

      <Divider my="xl" color="rgba(203, 178, 106, 0.3)" />

      {/* Magic & Items Section */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Spells/Incantations */}
        <Box>
          <Title order={4} mb="md" style={{ fontFamily: 'serif', color: '#cbb26a', borderBottom: '1px solid rgba(203, 178, 106, 0.3)', paddingBottom: 4 }}>
            Magic
          </Title>
          <Group align="flex-start">
             {[...(items.spells || []), ...(items.incantations || [])].length > 0 ? (
               [...(items.spells || []), ...(items.incantations || [])].map((spell: any, i: number) => (
                 <ItemTooltip key={i} itemName={spell.name} description={spell.description} stats={spell.stats} theme={theme}>
                    <Box 
                      p="xs" 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        cursor: 'help'
                      }}
                    >
                      <Text size="sm">{spell.name}</Text>
                    </Box>
                 </ItemTooltip>
               ))
             ) : (
               <Text size="sm" c="dimmed">No magic equipped</Text>
             )}
          </Group>
        </Box>

        {/* Flasks & Items */}
        <Box>
          <Title order={4} mb="md" style={{ fontFamily: 'serif', color: '#cbb26a', borderBottom: '1px solid rgba(203, 178, 106, 0.3)', paddingBottom: 4 }}>
            Items
          </Title>
          <Group align="flex-start">
             {/* Physick */}
             {(items.physick1 || items.physick2) && (
                <Box p="xs" style={{ border: '1px solid rgba(203, 178, 106, 0.5)', borderRadius: 4 }}>
                   <Text size="xs" c="#cbb26a" mb={4}>Wondrous Physick</Text>
                   <Stack gap={2}>
                      {items.physick1 && <Text size="sm">{items.physick1.name}</Text>}
                      {items.physick2 && <Text size="sm">{items.physick2.name}</Text>}
                   </Stack>
                </Box>
             )}
             
             {/* Consumables */}
             {items.consumables?.map((item: any, i: number) => (
                <ItemTooltip key={i} itemName={item.name} description={item.description} stats={item.stats} theme={theme}>
                   <Box 
                      p="xs" 
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        cursor: 'help'
                      }}
                    >
                      <Text size="sm">{item.name}</Text>
                    </Box>
                </ItemTooltip>
             ))}
          </Group>
        </Box>
      </SimpleGrid>
    </Paper>
  );
};

export default EldenRingBuildView;
