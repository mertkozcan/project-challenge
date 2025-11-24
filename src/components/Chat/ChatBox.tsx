import React, { useState, useEffect, useRef } from 'react';
import { Paper, TextInput, ScrollArea, Text, Group, ActionIcon, Button, Stack, Avatar, Tooltip } from '@mantine/core';
import { IconSend, IconMoodSmile } from '@tabler/icons-react';
import { useAppSelector } from '@/store';
import SocketService from '@/services/socket.service';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'QUICK';
  timestamp: string;
}

interface ChatBoxProps {
  roomId: string;
}

const QUICK_CHATS = ['GG', 'GLHF', 'Nice!', 'So close!', 'Bingo?', 'Wait...'];

const ChatBox: React.FC<ChatBoxProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const viewport = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state) => state.auth.userInfo);

  const scrollToBottom = () => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    SocketService.on('message-received', handleReceiveMessage);

    return () => {
      SocketService.off('message-received', handleReceiveMessage);
    };
  }, []);

  const handleSendMessage = (content: string, type: 'TEXT' | 'QUICK' = 'TEXT') => {
    if (!content.trim() || !user || !user.userId) return;

    SocketService.sendMessage(roomId, user.userId, user.username || 'Anonymous', content, type);

    if (type === 'TEXT') {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <Paper shadow="sm" radius="md" withBorder p="xs" h="100%" display="flex" style={{ flexDirection: 'column' }}>
      <Text fw={700} size="sm" mb="xs" c="dimmed">Room Chat</Text>
      
      <ScrollArea flex={1} viewportRef={viewport} type="always" mb="xs" style={{ height: '300px' }}>
        <Stack gap="xs">
          {messages.map((msg) => {
            const isMe = msg.userId === user?.userId;
            const isSystem = msg.type === 'SYSTEM';

            if (isSystem) {
              return (
                <Text key={msg.id} size="xs" c="dimmed" ta="center" fs="italic">
                  {msg.content}
                </Text>
              );
            }

            return (
              <Group key={msg.id} align="flex-start" justify={isMe ? 'flex-end' : 'flex-start'} gap="xs" wrap="nowrap">
                {!isMe && (
                  <Tooltip label={msg.username}>
                    <Avatar size="sm" radius="xl" color="blue" name={msg.username} />
                  </Tooltip>
                )}
                <Paper 
                  p="xs" 
                  radius="md" 
                  bg={isMe ? 'blue.1' : 'gray.1'} 
                  style={{ maxWidth: '80%' }}
                >
                  {!isMe && <Text size="xs" fw={700} c="dimmed">{msg.username}</Text>}
                  <Text size="sm" style={{ wordBreak: 'break-word' }}>{msg.content}</Text>
                </Paper>
              </Group>
            );
          })}
        </Stack>
      </ScrollArea>

      <Stack gap="xs">
        {/* Quick Chat Buttons */}
        <Group gap={4}>
          {QUICK_CHATS.map((text) => (
            <Button 
              key={text} 
              size="compact-xs" 
              variant="light" 
              color="gray" 
              onClick={() => handleSendMessage(text, 'QUICK')}
            >
              {text}
            </Button>
          ))}
        </Group>

        <Group gap="xs">
          <TextInput
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
            rightSection={
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconMoodSmile size={16} />
              </ActionIcon>
            }
          />
          <ActionIcon 
            variant="filled" 
            color="blue" 
            size="lg" 
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
};

export default ChatBox;
