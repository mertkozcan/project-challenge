import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AuthService } from '@/services/auth/auth.service';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

import { useTranslation } from 'react-i18next';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (value.length >= 3 ? null : t('auth.usernameMinLength')),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.invalidEmail')),
      password: (value) => (value.length >= 6 ? null : t('auth.passwordMinLength')),
      confirmPassword: (value, values) =>
        value === values.password ? null : t('auth.passwordsDoNotMatch'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      await AuthService.signUp(values.email, values.password, values.username);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" mb="xl">
        {t('auth.createAccount')}
      </Title>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red">
                {error}
              </Alert>
            )}

            {success && (
              <Alert icon={<IconCheck size={16} />} color="green">
                {t('auth.accountCreated')}
              </Alert>
            )}

            <TextInput
              label={t('auth.username')}
              placeholder={t('auth.usernamePlaceholder')}
              required
              {...form.getInputProps('username')}
            />

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

            <PasswordInput
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              {...form.getInputProps('confirmPassword')}
            />

            <Button type="submit" fullWidth loading={loading} disabled={success}>
              {t('auth.signUp')}
            </Button>

            <Text ta="center" size="sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Anchor component={Link} to="/sign-in" fw={700}>
                {t('auth.signIn')}
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default SignUp;
