import React, { useEffect, useState } from 'react';
import { Container, Title, Table, Avatar, Group, Text, Tabs, LoadingOverlay, Paper } from '@mantine/core';
import { LeaderboardService, LeaderboardEntry } from '@/services/leaderboard/leaderboard.service';
import { IconTrophy, IconMedal } from '@tabler/icons-react';

const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('completions');

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const data = await LeaderboardService.getGlobalRankings(activeTab as 'completions' | 'points');
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [activeTab]);

  const rows = rankings.map((entry, index) => (
    <Table.Tr key={entry.username}>
      <Table.Td>
        {index === 0 && <IconTrophy color="gold" size={20} />}
        {index === 1 && <IconMedal color="silver" size={20} />}
        {index === 2 && <IconMedal color="brown" size={20} />}
        {index > 2 && <Text fw={700} pl={4}>{index + 1}</Text>}
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar size={30} src={entry.avatar_url} radius={30} />
          <Text size="sm" fw={500}>
            {entry.username}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text fw={700} ta="right">
            {activeTab === 'completions' ? entry.completed_count : entry.score || 0}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl" ta="center">Global Leaderboards</Title>

      <Paper shadow="sm" p="md" withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List grow>
            <Tabs.Tab value="completions" leftSection={<IconTrophy size={16} />}>
              Most Completed
            </Tabs.Tab>
            <Tabs.Tab value="points" leftSection={<IconMedal size={16} />}>
              Top Points
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="completions" pt="xs">
            <div style={{ position: 'relative', minHeight: 200 }}>
                <LoadingOverlay visible={loading} />
                <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th w={60}>Rank</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th ta="right">Challenges Completed</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="points" pt="xs">
            <div style={{ position: 'relative', minHeight: 200 }}>
                <LoadingOverlay visible={loading} />
                <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th w={60}>Rank</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th ta="right">Total Points</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
                </Table>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default Leaderboard;
