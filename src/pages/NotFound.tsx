import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container style={{ textAlign: 'center', paddingTop: '100px' }}>
      <Title order={1} style={{ fontSize: '120px', fontWeight: 900 }}>
        404
      </Title>
      <Title order={2} style={{ marginTop: '20px' }}>
        Page Not Found
      </Title>
      <Text size="lg" style={{ marginTop: '10px', marginBottom: '30px' }}>
        The page you are looking for does not exist.
      </Text>
      <Group justify="center">
        <Button onClick={() => navigate('/')}>
          Go to Home
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Group>
    </Container>
  );
}
