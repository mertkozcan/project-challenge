import React from 'react';
import { Card, Text, Badge, Button, Group, Image, Grid, Skeleton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

interface BuildChallenge {
  id: number;
  gameImage: string; // Oyun resmi
  gameName: string; // Oyun adı
  buildName: string; // Build adı
  description: string; // Build açıklaması
}

interface BuildChallengeListProps {
  builds: BuildChallenge[]; // Build listesi
  loading:boolean
}

const BuildChallengeList: React.FC<BuildChallengeListProps> = ({ builds, loading }) => {
  const navigate = useNavigate();
  return (
    <>
    { loading ? (
        <div>
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} mb="sm" />
          <Skeleton height={20} />
        </div>
      ) : 
        <Grid>
      {builds.map((build, index) => (
        <Grid.Col span={6} key={index}>
          <Card
            shadow="md"
            padding="lg"
            radius="md"
            h="100%"
            style={{
              backgroundImage: 'linear-gradient(145deg, #1e1e2e, #151515)',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Oyun Görseli */}
            <Card.Section>
              <Image
                src={build.gameImage}
                alt={build.gameName}
                height={160}
                w="100%"
                fit="contain"
              />
            </Card.Section>

            {/* Oyun İsmi */}
            <Text size="lg" fw={700} mt="xs" mb={5} lineClamp={2} style={{ minHeight: '3em', lineHeight: '1.3' }}>
              {build.gameName}
            </Text>

            {/* Build İsmi ve Badge */}
            <Group justify="space-between" mb="xs" align="center">
              <Text size="sm" fw={600}>
                {build.buildName}
              </Text>
              <Badge color="cyan" variant="filled" size="sm">
                Build
              </Badge>
            </Group>

            <Text size="xs" color="gray.4" mt={0} lineClamp={3} style={{ minHeight: '4em', lineHeight: '1.3' }}>
              {build.description}
            </Text>

            {/* Katıl Butonu */}
            <Button 
                variant="outline" 
                color="cyan" 
                fullWidth 
                mt="auto"
                onClick={() => navigate(`/builds/${build.id}`)}
            >
              Explore Build
            </Button>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
}
    </>
  );
};

export default BuildChallengeList;
