import React, { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
  Checkbox,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import useAuth from '@/utils/hooks/useAuth';
import { IconAlertCircle } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.invalidEmail')),
      password: (value) => (value.length >= 6 ? null : t('auth.passwordMinLength')),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn({ 
        username: values.email, 
        password: values.password,
        rememberMe: values.rememberMe 
      });
      
      if (result?.status === 'failed') {
        setError(result.message || t('auth.loginFailed'));
      }
      // If success, useAuth hook will handle navigation
    } catch (err: any) {
      setError(err.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        {t('auth.welcomeBack')}
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}
            
            {(location.state as any)?.message && !error && (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" title={t('auth.authRequired')}>
                {(location.state as any).message}
              </Alert>
            )}

            <TextInput
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              required
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              required
              {...form.getInputProps('password')}
            />

            <Group justify="space-between" mt="md">
              <Checkbox
                label={t('auth.rememberMe')}
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
              />
              <Anchor component={Link} to="/forgot-password" size="sm">
                {t('auth.forgotPassword')}
              </Anchor>
            </Group>

            <Button type="submit" fullWidth loading={loading} mt="xl">
              {t('auth.signIn')}
            </Button>

            <Text ta="center" size="sm">
              {t('auth.dontHaveAccount')}{' '}
              <Anchor component={Link} to="/sign-up" fw={700}>
                {t('auth.signUp')}
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default SignIn;
