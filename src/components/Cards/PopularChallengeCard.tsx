import React from 'react';
import { Card, Image, Text, Badge, Table, Button, Group, Skeleton } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  name: string; // Kullanıcının adı
  time: number; // Kullanıcının süresi (saniye olarak)
}

interface PopularChallengeCardProps {
  challengeId: number; // Challenge ID
  gameImage: string; // Oyun resmi
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
  leaderboard: LeaderboardEntry[]; // İlk 3 kişinin bilgileri
  loading: boolean;
}

// Süre formatlama fonksiyonu
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Kupa renkleri
const trophyColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Altın, Gümüş, Bronz

const PopularChallengeCard: React.FC<PopularChallengeCardProps> = ({
  challengeId,
  gameImage,
  gameName,
  challengeName,
  description,
  leaderboard,
  loading,
}) => {
  const navigate = useNavigate();
  return (
    <Card
      shadow="md"
      padding="lg"
      radius="md"
      h={'100%'}
      style={{
        backgroundImage: 'linear-gradient(145deg, #1e1e2e, #151515)',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
        color: 'white',
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
          {/* Oyun Görseli */}
          <Card.Section>
            <Image src={gameImage} alt={gameName} height={160} w="100%" fit="contain" />
          </Card.Section>

          {/* Oyun Bilgileri */}
          <Group mt="md" mb="xs" justify="space-between">
            <Text size="lg">{gameName}</Text>
            <Badge color="yellow" variant="filled">
              Popular
            </Badge>
          </Group>

          <Text size="sm" color="gray.4">
            {challengeName}
          </Text>
          <Text size="xs" color="gray.5" mt="xs">
            {description}
          </Text>

          {/* Liderler Tablosu */}
          <Text
            size="lg"
            ta="center"
            mt="lg"
            style={{
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            Leaderboard
          </Text>

          {/* Tablo */}
          <Table highlightOnHover striped mt="sm">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>#</th>
                <th style={{ textAlign: 'left' }}>User</th>
                <th style={{ textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr key={index}>
                  <td>
                    <IconTrophy size={16} color={trophyColors[index]} />
                  </td>
                  <td>{player.name}</td>
                  <td>{formatTime(player.time)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Challenge Katıl Butonu */}
          <Button 
            variant="outline" 
            color="yellow" 
            fullWidth 
            mt="15"
            onClick={() => navigate(`/challenges/${challengeId}`)}
          >
            Join
          </Button>
        </>
      )}
    </Card>
  );
};

export default PopularChallengeCard;
