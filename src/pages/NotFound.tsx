import { Container, Title, Text, Button, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container style={{ textAlign: 'center', paddingTop: '100px' }}>
      <Title order={1} style={{ fontSize: '120px', fontWeight: 900 }}>
        404
      </Title>
      <Title order={2} style={{ marginTop: '20px' }}>
        {t('notFound.title')}
      </Title>
      <Text size="lg" style={{ marginTop: '10px', marginBottom: '30px' }}>
        {t('notFound.message')}
      </Text>
      <Group justify="center">
        <Button onClick={() => navigate('/')}>
          {t('notFound.goHome')}
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t('notFound.goBack')}
        </Button>
      </Group>
    </Container>
  );
}
