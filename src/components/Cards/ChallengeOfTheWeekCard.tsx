import React from 'react';
import { Card, Text, Table, Button, Group, Badge, Skeleton } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';

interface LeaderboardEntry {
  name: string; // Oyuncu adı
  time: number; // Süre (saniye olarak)
}

interface ChallengeOfTheWeekProps {
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
  reward: string; // Ödül
  leaderboard: LeaderboardEntry[]; // Liderlik tablosu
  loading: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ChallengeOfTheWeek: React.FC<ChallengeOfTheWeekProps> = ({
  gameName,
  challengeName,
  description,
  reward,
  leaderboard,
  loading,
}) => {
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      h={'100%'}
      style={{
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        background: 'linear-gradient(145deg, #1e1e2e, #151515)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
      }}
    >
      {loading ? (
        <div>
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} />
        </div>
      ) : (
        <>
          <Group justify="space-between" mb="md" align="center">
            <Badge color="green" size="lg">
              Reward: {reward}
            </Badge>
            <Badge color="grape" variant="filled" size="lg" radius="sm">
              {gameName}
            </Badge>
          </Group>

          <Text
            size="lg"
            ta="center"
            mb={10}
            style={{
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            Challenge of the Week
          </Text>

          <Text fw={700} size="md" mt="md">
            {challengeName}
          </Text>
          <Text size="sm" color="gray.4" mt="xs">
            {description}
          </Text>

          <Text fw={700} size="md" mt="lg" mb={5} ta="center">
            Leaderboard
          </Text>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            <Table highlightOnHover striped>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>#</th>
                  <th style={{ textAlign: 'left' }}>User</th>
                  <th style={{ textAlign: 'center' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={index}>
                    <td>
                      {index < 3 ? (
                        <IconTrophy
                          size={16}
                          color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                        />
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td>{player.name}</td>
                    <td style={{ textAlign: 'center' }}>{formatTime(player.time)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Button variant="outline" color="yellow" fullWidth mt="60">
            Join
          </Button>
        </>
      )}
    </Card>
  );
};

export default ChallengeOfTheWeek;
