import React, { useState } from 'react';
import { 
  Card, Text, Group, Button, Stack, Image, 
  FileInput, Alert, Loader, Box, TextInput 
} from '@mantine/core';
import { IconUpload, IconPhoto, IconCheck, IconAlertTriangle, IconVideo } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ApiService from '@/services/ApiService';
import { OCRService } from '@/services/ocr.service';
import { useAppSelector } from '@/store';
import { RunSession, RunSessionService } from '@/services/runSession.service';

interface ProofSubmissionProps {
  session: RunSession;
  challengeId: string | number;
  onSuccess?: () => void;
}

const ProofSubmission: React.FC<ProofSubmissionProps> = ({ session, challengeId, onSuccess }) => {
  const userId = useAppSelector((state) => state.auth.userInfo.userId);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<'IDLE' | 'PROCESSING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [ocrText, setOcrText] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this challenge? You will lose your current character name.')) return;
    
    try {
      setCancelling(true);
      await RunSessionService.cancelSession(session.id);
      notifications.show({
        title: 'Challenge Cancelled',
        message: 'You have cancelled the challenge.',
        color: 'blue',
      });
      if (onSuccess) onSuccess(); // Reuse onSuccess to refresh parent state
    } catch (error) {
      console.error('Failed to cancel session:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel challenge.',
        color: 'red',
      });
    } finally {
      setCancelling(false);
    }
  };

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

      const isVerified = OCRService.verifyUsername(result.text, expectedUsername);
      setOcrStatus(isVerified ? 'VERIFIED' : 'FAILED');
      
      if (isVerified) {
        notifications.show({
          title: 'Username Verified!',
          message: `Found "${expectedUsername}" in the screenshot.`,
          color: 'green',
          icon: <IconCheck size={16} />
        });
      } else {
        notifications.show({
          title: 'Username Not Detected',
          message: `Could not find "${expectedUsername}" automatically. Manual review will be required.`,
          color: 'orange',
          icon: <IconAlertTriangle size={16} />
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrStatus('FAILED');
      notifications.show({
        title: 'OCR Failed',
        message: 'Could not process image. Manual review required.',
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
      // Use the explicitly passed challengeId instead of relying on the potentially buggy session object
      formData.append('challenge_id', challengeId.toString());
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
        title: 'Proof Submitted',
        message: 'Your proof has been uploaded successfully!',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      notifications.show({
        title: 'Upload Failed',
        message: 'Failed to upload proof. Please try again.',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Stack gap="md">
        <Box>
          <Text fw={700} size="lg">Submit Proof</Text>
          <Text c="dimmed" size="sm">
            Please upload a screenshot showing your character name: 
            <Text span fw={700} c="blue"> {session.display_username}</Text>
          </Text>
        </Box>

        <FileInput
          label="1. Upload Screenshot (Required)"
          description="Upload a screenshot showing your character name and stats."
          placeholder="Click to select file"
          accept="image/png,image/jpeg"
          leftSection={<IconPhoto size={16} />}
          onChange={handleFileChange}
          clearable
          required
        />

        <TextInput
          label="2. Video Link (Required)"
          description="YouTube, Twitch, or Streamable link showing the challenge completion."
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
                <Text size="sm" c="dimmed">Verifying username...</Text>
              </Group>
            )}

            {ocrStatus === 'VERIFIED' && (
              <Alert color="green" icon={<IconCheck size={16} />} title="Verified">
                Username detected! This proof will be auto-verified for trusted users.
              </Alert>
            )}

            {ocrStatus === 'FAILED' && (
              <Alert color="orange" icon={<IconAlertTriangle size={16} />} title="Not Detected">
                Username not automatically detected. This proof will require manual peer review.
              </Alert>
            )}
          </Stack>
        )}

        <Group grow>
          <Button 
            size="md" 
            onClick={handleSubmit} 
            loading={uploading}
            disabled={!file || !videoUrl || ocrStatus === 'PROCESSING'}
            leftSection={<IconUpload size={16} />}
          >
            Submit Proof
          </Button>
          <Button 
            size="md" 
            variant="light" 
            color="red" 
            onClick={handleCancel}
            loading={cancelling}
          >
            Cancel Challenge
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default ProofSubmission;
