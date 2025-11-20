import React, { useEffect, useState } from 'react';
import { Table, Text, Avatar, Group, Badge, Box } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { LeaderboardService } from '@/services/leaderboard/leaderboard.service';

interface EnhancedLeaderboardProps {
  challengeId: string;
  currentUserId?: string;
}

const EnhancedLeaderboard: React.FC<EnhancedLeaderboardProps> = ({ challengeId, currentUserId }) => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const data = await LeaderboardService.getChallengeRankings(challengeId, currentUserId);
        setRankings(data.rankings);
        setUserRank(data.userRank);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [challengeId, currentUserId]);

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return undefined;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'yellow';
      case 2: return 'gray';
      case 3: return 'orange';
      default: return 'blue';
    }
  };

  if (loading) return <Text>Loading rankings...</Text>;
  if (!rankings || rankings.length === 0) return <Text c="dimmed">No completions yet. Be the first!</Text>;

  return (
    <Box>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Rank</Table.Th>
            <Table.Th>User</Table.Th>
            <Table.Th>Score</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rankings.map((entry, index) => {
            const rank = entry.rank; // Use rank from backend
            const isCurrentUser = currentUserId && entry.user_id === currentUserId;
            const trophyColor = getTrophyColor(rank);

            return (
              <Table.Tr
                key={index}
                style={{
                  backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.1)' : undefined,
                  animation: `fadeIn 0.3s ease-in-out ${index * 0.05}s both`,
                }}
              >
                <Table.Td>
                  <Group gap="xs">
                    {rank <= 3 ? (
                      <IconTrophy
                        size={24}
                        color={trophyColor}
                        style={{
                          filter: `drop-shadow(0 0 8px ${trophyColor})`,
                        }}
                      />
                    ) : (
                      <Badge color={getRankBadgeColor(rank)} size="lg" circle>
                        {rank}
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar
                      src={entry.avatar_url}
                      alt={entry.username}
                      radius="xl"
                      size="md"
                      color="blue"
                    >
                      {entry.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text fw={isCurrentUser ? 700 : 500}>
                        {entry.username}
                        {isCurrentUser && (
                          <Badge ml="xs" size="sm" color="blue">
                            You
                          </Badge>
                        )}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text fw={600} c={rank <= 3 ? getTrophyColor(rank) : undefined}>
                    {entry.score}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default EnhancedLeaderboard;
