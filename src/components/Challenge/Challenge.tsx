import React, { useState, useEffect } from 'react';
import { Card, Text, Badge, Button, Table, Progress, Group } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';

const ChallengePage = () => {
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => {
    // Örnek API çağrısı
    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const data = {
          id: 1,
          name: "Ultimate Survivor",
          description: "Tamamla ve kazan! Bu görevde hayatta kalma yeteneklerini test edeceksin.",
          reward: "Golden Badge",
          startDate: "2024-01-01",
          endDate: "2024-01-10",
          leaderboard: [
            { name: "Player1", score: 95 },
            { name: "Player2", score: 85 },
            { name: "Player3", score: 80 },
          ],
        };
        setChallenge(data);
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, []);

  const handleJoin = () => {
    setJoined(true);
    alert("Challenge'a katıldınız!");
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Card shadow="md" padding="lg" radius="md">
      {/* Başlık ve Ödül */}
      <Group justify="space-between">
        <Text size="xl" fw={700}>
          {challenge.name}
        </Text>
        <Badge color="yellow" size="lg">
          Reward: {challenge.reward}
        </Badge>
      </Group>

      {/* Açıklama ve Tarihler */}
      <Text size="sm" mt="md">
        {challenge.description}
      </Text>
      <Group mt="md">
        <Text size="xs" color="dimmed">
          Start Date: {challenge.startDate}
        </Text>
        <Text size="xs" color="dimmed">
          End Date: {challenge.endDate}
        </Text>
      </Group>

      {/* Katılım Durumu */}
      <Group mt="lg" justify="space-between">
        {!joined ? (
          <Button onClick={handleJoin} variant="outline" color="green">
            Join Challenge
          </Button>
        ) : (
          <div>
            <Text size="sm">Progress:</Text>
            <Progress value={50} size="sm" color="blue" />
          </div>
        )}
      </Group>

      {/* Lider Tablosu */}
      <Text size="lg" mt="xl" fw={600} style={{
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}>
        Leaderboard
      </Text>
      <Table mt="md" highlightOnHover>
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {challenge.leaderboard.map((player: any, index: number) => (
            <tr key={index}>
              <td>
                {index < 3 ? (
                  <IconTrophy
                    size={16}
                    color={index === 0 ? "gold" : index === 1 ? "silver" : "bronze"}
                  />
                ) : (
                  index + 1
                )}
              </td>
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default ChallengePage;
