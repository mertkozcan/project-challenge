import React from 'react';
import { Paper, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BingoCellProps {
  task: string;
  isCompleted: boolean;
  completedBy?: string; // Username of who completed it (for multiplayer)
  isMyCompletion?: boolean; // If true, shows green; if false (opponent), shows blue
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const BingoCell: React.FC<BingoCellProps> = ({
  task,
  isCompleted,
  completedBy,
  isMyCompletion = true, // Default to true for solo mode
  onClick,
  disabled = false,
  style,
}) => {
  // Determine colors based on completion state
  const getBackgroundColor = () => {
    if (!isCompleted) return 'var(--mantine-color-body)';
    return isMyCompletion 
      ? 'rgba(64, 192, 87, 0.15)' // Green for me
      : 'rgba(34, 139, 230, 0.15)'; // Blue for opponent
  };

  const getBorderColor = () => {
    if (!isCompleted) return undefined;
    return isMyCompletion ? '#40c057' : '#228be6';
  };

  const getIconColor = () => {
    return isMyCompletion ? '#40c057' : '#228be6';
  };

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={!disabled && !isCompleted ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isCompleted ? { scale: 0.95 } : undefined}
      style={{ flex: '1 1 0', minWidth: 0, height: '100%' }}
    >
      <Paper
        p="xs"
        withBorder
        onClick={() => !disabled && !isCompleted && onClick?.()}
        style={{
          height: 'auto',
          aspectRatio: '1/1',
          minHeight: '60px',
          maxHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: disabled || isCompleted ? 'default' : 'pointer',
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isCompleted ? 2 : 1,
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Task Text */}
        <Text
          size="sm"
          ta="center"
          fw={500}
          style={{
            zIndex: 1,
            userSelect: 'none',
            fontSize: 'clamp(0.6rem, 2vw, 0.9rem)',
            lineHeight: 1.2,
          }}
        >
          {task}
        </Text>

        {/* Completion Animation (Checkmark) */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                zIndex: 2,
              }}
            >
              <IconCheck size={16} color={getIconColor()} stroke={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Effect on Completion */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: getIconColor(),
                transform: 'translate(-50%, -50%)',
                zIndex: 0,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Opponent Name Label */}
        {isCompleted && !isMyCompletion && completedBy && (
          <Text
            size="xs"
            c="blue"
            fw={700}
            style={{
              position: 'absolute',
              top: 2,
              fontSize: '0.6rem',
              opacity: 0.9,
              zIndex: 2,
            }}
          >
            {completedBy}
          </Text>
        )}
      </Paper>
    </motion.div>
  );
};

export default BingoCell;
