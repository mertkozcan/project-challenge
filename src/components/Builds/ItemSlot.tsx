import { Card, Text, Image, ActionIcon, Stack, Box, Tooltip, Divider, SimpleGrid, Group } from '@mantine/core';
import { IconX, IconPlus } from '@tabler/icons-react';
import { GameItem } from '@/services/games/gameData.provider';

interface ItemSlotProps {
  label: string;
  item?: GameItem | null;
  onSelect: () => void;
  onClear: () => void;
  theme?: any;
  disabled?: boolean;
  secondaryItem?: GameItem | null;
  onSecondarySelect?: () => void;
  onSecondaryClear?: () => void;
  secondaryLabel?: string;
}

const ItemSlot = ({ 
  label, 
  item, 
  onSelect, 
  onClear, 
  theme, 
  disabled = false,
  secondaryItem,
  onSecondarySelect,
  onSecondaryClear,
  secondaryLabel = 'Ash of War'
}: ItemSlotProps) => {
  const primaryColor = theme?.primary || '#228be6';

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Card
        padding="md"
        radius="md"
        style={{
          background: item ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
          border: `2px solid ${item ? primaryColor + '60' : 'rgba(255, 255, 255, 0.1)'}`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: 120,
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
        onClick={!disabled ? onSelect : undefined}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.border = `2px solid ${primaryColor}`;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.border = `2px solid ${item ? primaryColor + '60' : 'rgba(255, 255, 255, 0.1)'}`;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {item ? (
          <>
            {/* Clear button */}
            <ActionIcon
              size="sm"
              variant="filled"
              color="red"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <IconX size={14} />
            </ActionIcon>

            {/* Item content */}
            <Stack gap="xs" align="center" style={{ flex: 1 }}>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  fit="contain"
                />
              )}
              <Tooltip 
                label={
                  <Stack gap={2} p={4}>
                    <Text size="sm" fw={700}>{item.name}</Text>
                    
                    {/* Armor Stats */}
                    {item.stats?.negation && (
                      <>
                        <Divider my={4} color="gray.7" />
                        <Text size="xs" fw={700} c="dimmed">Damage Negation</Text>
                        <SimpleGrid cols={2} spacing="xs">
                           {item.stats.negation.map((n: any, i: number) => (
                              <Text key={i} size="xs">{n.name}: {n.amount}</Text>
                           ))}
                        </SimpleGrid>
                      </>
                    )}
                    
                    {item.stats?.weight && (
                       <Text size="xs" mt={4} c="dimmed">Weight: {item.stats.weight}</Text>
                    )}

                    {/* Armor Description (often contains passive effects) */}
                    {item.category && ['Helm', 'Chest Armor', 'Gauntlets', 'Leg Armor'].includes(item.category) && item.description && (
                        <>
                            <Divider my={4} color="gray.7" />
                            <Text size="xs" c="dimmed" style={{ whiteSpace: 'normal', maxWidth: 250 }}>
                                {item.description}
                            </Text>
                        </>
                    )}

                    {/* Spirit Ash Costs */}
                    {(item.stats?.fpCost || item.stats?.hpCost) && (
                        <>
                            <Divider my={4} color="gray.7" />
                            <Group gap="xs">
                                {item.stats.fpCost && <Text size="xs" c="blue.3">FP Cost: {item.stats.fpCost}</Text>}
                                {item.stats.hpCost && <Text size="xs" c="red.3">HP Cost: {item.stats.hpCost}</Text>}
                            </Group>
                        </>
                    )}

                    {/* Talisman/Item Effects */}
                    {(item.stats?.effects || item.stats?.effect) && (
                      <>
                        <Divider my={4} color="gray.7" />
                        <Text size="xs" fw={700} c="dimmed">Effect</Text>
                        {Array.isArray(item.stats?.effects) ? (
                           item.stats.effects.map((e: any, i: number) => (
                             <Text key={i} size="xs" style={{ whiteSpace: 'normal', maxWidth: 250 }}>{e}</Text>
                           ))
                        ) : (
                           <Text size="xs" style={{ whiteSpace: 'normal', maxWidth: 250 }}>{item.stats?.effect}</Text>
                        )}
                      </>
                    )}
                    
                    {/* Weapon Scaling/Reqs */}
                    {item.stats?.scaling && (
                       <>
                        <Divider my={4} color="gray.7" />
                        <Text size="xs" fw={700} c="dimmed">Scaling</Text>
                        <Group gap="xs">
                           {item.stats.scaling.map((s: any, i: number) => (
                              <Text key={i} size="xs">{s.name}: {s.scaling}</Text>
                           ))}
                        </Group>
                       </>
                    )}
                     {item.stats?.requirements && (
                       <>
                        <Text size="xs" fw={700} c="dimmed" mt={4}>Requires</Text>
                        <Group gap="xs">
                           {item.stats.requirements
                               .filter((r: any) => r.amount > 0 || r.value > 0)
                               .map((r: any, i: number) => (
                              <Text key={i} size="xs">{r.name}: {r.amount || r.value}</Text>
                           ))}
                        </Group>
                       </>
                    )}
                  </Stack>
                } 
                withArrow
                multiline
                w={300}
              >
                <Text
                  size="sm"
                  fw={600}
                  c={primaryColor}
                  ta="center"
                  lineClamp={2}
                  style={{ wordBreak: 'break-word' }}
                >
                  {item.name}
                </Text>
              </Tooltip>
            </Stack>

            {/* Secondary Item (Ash of War) */}
            {onSecondarySelect && (
              <Box
                mt="sm"
                pt="xs"
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '100%',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSecondarySelect();
                }}
              >
                <Text size="xs" c="dimmed" ta="center" mb={4}>{secondaryLabel}</Text>
                {secondaryItem ? (
                  <Box 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 4,
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    <Text size="xs" c={primaryColor} lineClamp={1} style={{ flex: 1, textAlign: 'center' }}>
                      {secondaryItem.name}
                    </Text>
                    <ActionIcon 
                      size="xs" 
                      color="red" 
                      variant="subtle" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onSecondaryClear?.(); 
                      }}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  </Box>
                ) : (
                  <Box 
                    style={{ 
                      border: '1px dashed rgba(255,255,255,0.2)', 
                      borderRadius: 4, 
                      padding: 4, 
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <IconPlus size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                    <Text span size="xs" ml={4}>Add</Text>
                  </Box>
                )}
              </Box>
            )}
          </>
        ) : (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <IconPlus size={32} color="rgba(255, 255, 255, 0.3)" />
          </Box>
        )}
      </Card>
    </Stack>
  );
};

export default ItemSlot;
