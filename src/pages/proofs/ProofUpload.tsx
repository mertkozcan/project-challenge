import React, { useState, useRef } from 'react';
import { 
  Container, Title, Card, Text, Group, Button, Stack, Image, 
  FileInput, Alert, Loader, Progress, Box, TextInput 
} from '@mantine/core';
import { IconUpload, IconPhoto, IconCheck, IconX, IconAlertTriangle, IconVideo } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiService from '@/services/ApiService';
import { OCRService } from '@/services/ocr.service';
import { useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';

const ProofUpload: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useAppSelector((state) => state.auth.userInfo.userId);
  
  // Get session data passed from ActiveRunCard
  const session = location.state?.session;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<'IDLE' | 'PROCESSING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrConfidence, setOcrConfidence] = useState<number>(0);

  const [videoUrl, setVideoUrl] = useState('');

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setFile(null);
      setPreviewUrl(null);
      setOcrStatus('IDLE');
      return;
    }

    setFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Start OCR automatically
    if (session?.display_username) {
      await runOCR(objectUrl, session.display_username);
    }
  };

  const runOCR = async (imageUrl: string, expectedUsername: string) => {
    try {
      setOcrStatus('PROCESSING');
      const result = await OCRService.processImage(imageUrl);
      setOcrText(result.text);
      setOcrConfidence(result.confidence);

      const isVerified = OCRService.verifyUsername(result.text, expectedUsername);
      setOcrStatus(isVerified ? 'VERIFIED' : 'FAILED');
      
      if (isVerified) {
        notifications.show({
          title: t('proof.usernameVerified'),
          message: t('proof.usernameFound', { username: expectedUsername }),
          color: 'green',
          icon: <IconCheck size={16} />
        });
      } else {
        notifications.show({
          title: t('proof.usernameNotDetected'),
          message: t('proof.manualReviewRequired', { username: expectedUsername }),
          color: 'orange',
          icon: <IconAlertTriangle size={16} />
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('FAILED');
      notifications.show({
        title: t('proof.ocrFailed'),
        message: t('proof.ocrProcessError'),
        color: 'red'
      });
    }
  };

  const handleSubmit = async () => {
    if (!file || !session || !videoUrl) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('media', file);
      formData.append('user_id', userId);
      formData.append('challenge_id', session.challenge_id?.toString() || '');
      formData.append('run_code', session.run_code);
      formData.append('media_type', 'image');
      formData.append('ocr_result', ocrStatus);
      formData.append('ocr_extracted_text', ocrText);
      formData.append('video_url', videoUrl);

      await ApiService.fetchData({
        url: '/proofs',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifications.show({
        title: t('proof.submitted'),
        message: t('proof.submittedMsg'),
        color: 'green',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      notifications.show({
        title: t('proof.uploadFailed'),
        message: t('proof.uploadError'),
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  if (!session) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title={t('proof.invalidSession')}>
          {t('proof.noActiveSession')}
        </Alert>
        <Button mt="md" onClick={() => navigate('/dashboard')}>{t('nav.dashboard')}</Button>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">{t('proof.submitProof')}</Title>
      
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Stack gap="md">
          <Box>
            <Text fw={700} size="lg">{session.game_name} {t('challenges.title')}</Text>
            <Text c="dimmed" size="sm">
              {t('proof.uploadPrompt')} 
              <Text span fw={700} c="blue"> {session.display_username}</Text>
            </Text>
          </Box>

          <FileInput
            label={t('proof.uploadScreenshot')}
            description={t('proof.uploadScreenshotDesc')}
            placeholder={t('proof.clickToSelect')}
            accept="image/png,image/jpeg"
            leftSection={<IconPhoto size={16} />}
            onChange={handleFileChange}
            clearable
            required
          />

          <TextInput
            label={t('proof.videoLink')}
            description={t('proof.videoLinkDesc')}
            placeholder="https://youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.currentTarget.value)}
            leftSection={<IconVideo size={16} />}
            required
          />

          {previewUrl && (
            <Stack gap="xs">
              <Image 
                src={previewUrl} 
                radius="md" 
                alt="Preview" 
                style={{ maxHeight: 300, objectFit: 'contain' }} 
              />
              
              {ocrStatus === 'PROCESSING' && (
                <Group gap="sm">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">{t('proof.verifyingUsername')}</Text>
                </Group>
              )}

              {ocrStatus === 'VERIFIED' && (
                <Alert color="green" icon={<IconCheck size={16} />} title={t('common.verified')}>
                  {t('proof.usernameDetected')}
                </Alert>
              )}

              {ocrStatus === 'FAILED' && (
                <Alert color="orange" icon={<IconAlertTriangle size={16} />} title={t('common.notDetected')}>
                  {t('proof.usernameNotDetectedManual')}
                </Alert>
              )}
            </Stack>
          )}

          <Button 
            fullWidth 
            size="md" 
            onClick={handleSubmit} 
            loading={uploading}
            disabled={!file || !videoUrl || ocrStatus === 'PROCESSING'}
            leftSection={<IconUpload size={16} />}
          >
            {t('proof.submitProof')}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
};

export default ProofUpload;
