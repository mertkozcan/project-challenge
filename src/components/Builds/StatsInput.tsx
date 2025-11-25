import { SimpleGrid, NumberInput, Text, Stack, Group, Paper } from '@mantine/core';

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
}

const StatsInput = ({ stats, onChange, theme }: StatsInputProps) => {
  const handleChange = (key: keyof CharacterStats, value: number | string) => {
    onChange({
      ...stats,
      [key]: Number(value),
    });
  };

  const statConfig = [
    { key: 'level', label: 'Level', min: 1, max: 713 },
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
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
        {statConfig.map((stat) => (
          <Stack key={stat.key} gap={4}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {stat.label}
            </Text>
            <NumberInput
              value={stats[stat.key as keyof CharacterStats]}
              onChange={(val) => handleChange(stat.key as keyof CharacterStats, val)}
              min={stat.min}
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
        ))}
      </SimpleGrid>
    </Paper>
  );
};

export default StatsInput;
