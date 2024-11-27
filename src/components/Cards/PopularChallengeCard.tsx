import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Avatar,
  Stack,
  Divider,
  Table,
  Flex,
} from '@mantine/core';
import classes from './PopularChallengeCard.module.css';

interface LeaderboardEntry {
  avatar: string; // Kullanıcının profil resmi
  name: string; // Kullanıcının adı
  time: number; // Kullanıcının süresi
}

interface PopularChallengeCardProps {
  gameImage: string; // Oyun resmi
  gameName: string; // Oyun adı
  challengeName: string; // Challenge adı
  description: string; // Challenge açıklaması
  leaderboard: LeaderboardEntry[]; // İlk 3 kişinin bilgileri
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PopularChallengeCard: React.FC<PopularChallengeCardProps> = ({
  gameImage,
  gameName,
  challengeName,
  description,
  leaderboard,
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* Oyun Resmi */}
      <Card.Section>
        <Image src={gameImage} height={160} alt={gameName} />
      </Card.Section>

      {/* Oyun ve Challenge Bilgileri */}
      <Group p="apart" mt="md" mb="xs">
        <Text w={500} size="lg">
          {gameName}
        </Text>
        <Badge color="pink" variant="light">
          Popüler
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        {challengeName}
      </Text>
      <Text size="xs" color="dimmed" mt="xs">
        {description}
      </Text>

      <Divider my="sm" />

      <Text w={500} size="sm" mb="xs">
        Liderler
      </Text>
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>#</th>
            <th>Oyuncu</th>
            <th>Süre</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={index}>
              <td className={classes.td}>{index + 1}</td>
              <td className={classes.td}>
                <Flex align="center" gap="sm">
                  <Avatar src={player.avatar} radius="xl" size="sm" />
                  <Text size="sm">{player.name}</Text>
                </Flex>
              </td>
              <td className={classes.td}>{formatTime(player.time)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default PopularChallengeCard;
