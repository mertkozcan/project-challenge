import React from 'react';
import { Card, Image, Text, Badge, Table, Button, Group, Skeleton, Stack, Divider } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface LeaderboardEntry {
  name: string; // Kullanıcının adı
  score: number; // Kullanıcının puanı
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {loading ? (
        <div>
          <Skeleton height={140} mb="sm" />
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} />
        </div>
      ) : (
        <>
          {/* Oyun Görseli */}
          <Card.Section style={{ position: 'relative' }}>
            <Image src={gameImage} alt={gameName} height={140} w="100%" fit="cover" />
            <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
                padding: '10px 16px' 
            }}>
                <Text fw={700} size="lg" c="white">{gameName}</Text>
            </div>
            <Badge 
                color="yellow" 
                variant="filled" 
                style={{ position: 'absolute', top: 10, right: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              Popular
            </Badge>
          </Card.Section>

          {/* Content */}
          <Stack mt="md" gap="xs" style={{ flexGrow: 1 }}>
            <Text fw={700} size="md" lineClamp={1} title={challengeName}>
                {challengeName}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={2} title={description}>
                {description}
            </Text>
            
            <Divider my="xs" label={<Text size="xs" c="dimmed">Top Performers</Text>} labelPosition="center" color="dark.4" />
            
            {/* Compact Leaderboard */}
            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                <Table verticalSpacing={4} withRowBorders={false}>
                    <tbody>
                    {leaderboard.length > 0 ? (
                        leaderboard.map((player, index) => (
                        <tr key={index}>
                            <td style={{ width: '30px' }}>
                                <IconTrophy size={14} color={trophyColors[index]} />
                            </td>
                            <td>
                                <Text size="sm" c="gray.3">{player.name}</Text>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <Text size="sm" fw={700} c="yellow.2">{player.score}</Text>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3}>
                                <Text size="xs" c="dimmed" ta="center">No records yet</Text>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>
          </Stack>

          {/* Challenge Katıl Butonu */}
          <Button 
            variant="light" 
            color="yellow" 
            fullWidth 
            mt="md"
            onClick={() => navigate(`/challenges/${challengeId}`)}
          >
            Join Challenge
          </Button>
        </>
      )}
    </Card>
  );
};

export default PopularChallengeCard;
