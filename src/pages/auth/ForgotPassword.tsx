import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
  Center,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '@/utils/hooks/useAuth';
import { IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.invalidEmail')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await resetPassword(values.email);
      
      if (result?.status === 'failed') {
        setError(result.message || t('auth.loginFailed')); // Use dynamic error or generic fail
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        {t('auth.forgotPasswordTitle')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={-20} mb={30}>
        {t('auth.forgotPasswordDesc')}
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md">
        {!success ? (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red">
                  {error}
                </Alert>
              )}

              <TextInput
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                required
                {...form.getInputProps('email')}
              />

              <Button type="submit" fullWidth loading={loading}>
                {t('auth.sendResetLink')}
              </Button>

              <Center>
                <Anchor component={Link} to="/sign-in" size="sm" c="dimmed">
                  <Center inline>
                    <IconArrowLeft size={12} stroke={1.5} />
                    <Box ml={5}>{t('auth.backToSignIn')}</Box>
                  </Center>
                </Anchor>
              </Center>
            </Stack>
          </form>
        ) : (
          <Stack>
            <Alert icon={<IconCheck size={16} />} color="green" title={t('auth.emailSentTitle')}>
              {t('auth.emailSentDesc')}
            </Alert>
            <Button component={Link} to="/sign-in" fullWidth variant="outline">
              {t('auth.backToSignIn')}
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
