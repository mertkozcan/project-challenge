import { SimpleGrid, NumberInput, Text, Stack, Group, Paper } from '@mantine/core';
import { EldenRingClass } from '@/services/games/eldenRing.provider';

export interface CharacterStats {
  level: number;
  vigor: number;
  mind: number;
  endurance: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  faith: number;
  arcane: number;
}

interface StatsInputProps {
  stats: CharacterStats;
  onChange: (stats: CharacterStats) => void;
  theme: any;
  minStats?: EldenRingClass;
  pointsRemaining?: number;
}

const StatsInput = ({ stats, onChange, theme, minStats, pointsRemaining = 999 }: StatsInputProps) => {
  const handleChange = (key: keyof CharacterStats, value: number | string) => {
    const numValue = Number(value);
    const currentValue = stats[key];
    
    // Validation Logic
    if (minStats) {
        // Prevent going below base class stats
        // The API returns stats as strings, so we need to cast them
        // Also map 'intelligence' correctly as API might use 'intelligence' or 'inteligence' (typo in some APIs)
        // Our interface says 'intelligence', let's assume it matches or we map it.
        // The key in CharacterStats is 'intelligence'.
        
        const minStatVal = Number((minStats.stats as any)[key]);
        
        if (!isNaN(minStatVal)) {
             if (numValue < minStatVal) return;
        }
        
        // Prevent increasing if no points remaining (only if increasing)
        if (numValue > currentValue && pointsRemaining <= 0) return;
    }

    onChange({
      ...stats,
      [key]: numValue,
    });
  };

  const statConfig = [
    // Level is now handled in parent
    { key: 'vigor', label: 'Vigor', min: 1, max: 99 },
    { key: 'mind', label: 'Mind', min: 1, max: 99 },
    { key: 'endurance', label: 'Endurance', min: 1, max: 99 },
    { key: 'strength', label: 'Strength', min: 1, max: 99 },
    { key: 'dexterity', label: 'Dexterity', min: 1, max: 99 },
    { key: 'intelligence', label: 'Intelligence', min: 1, max: 99 },
    { key: 'faith', label: 'Faith', min: 1, max: 99 },
    { key: 'arcane', label: 'Arcane', min: 1, max: 99 },
  ];

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${theme.primary}20`,
      }}
    >
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {statConfig.map((stat) => {
            let minVal = stat.min;
            if (minStats) {
                 const val = Number((minStats.stats as any)[stat.key]);
                 if (!isNaN(val)) minVal = val;
            }

            return (
              <Stack key={stat.key} gap={4}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.label}
                </Text>
                <NumberInput
                  value={stats[stat.key as keyof CharacterStats]}
                  onChange={(val) => handleChange(stat.key as keyof CharacterStats, val)}
                  min={minVal}
                  max={stat.max}
                  allowNegative={false}
                  styles={{
                    input: {
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${theme.primary}30`,
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: 600,
                    },
                  }}
                />
              </Stack>
            );
        })}
      </SimpleGrid>
    </Paper>
  );
};

export default StatsInput;
