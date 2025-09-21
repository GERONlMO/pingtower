import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { Wifi, WifiOff, Sync } from '@mui/icons-material';

export interface WebSocketStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string | null;
  lastUpdated?: string | null;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  isConnected,
  isConnecting,
  error,
  lastUpdated
}) => {
  const getStatusProps = () => {
    if (isConnecting) {
      return {
        label: 'Подключение...',
        color: 'default' as const,
        icon: <Sync sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
      };
    }
    
    if (!isConnected || error) {
      return {
        label: 'Нет подключения',
        color: 'error' as const,
        icon: <WifiOff />
      };
    }
    
    return {
      label: 'Подключен',
      color: 'success' as const,
      icon: <Wifi />
    };
  };

  const statusProps = getStatusProps();
  const tooltipText = error 
    ? `Ошибка: ${error}` 
    : lastUpdated 
      ? `Последнее обновление: ${new Date(lastUpdated).toLocaleString('ru-RU')}`
      : '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={tooltipText} arrow>
        <Chip
          icon={statusProps.icon}
          label={statusProps.label}
          color={statusProps.color}
          size="small"
          variant="outlined"
        />
      </Tooltip>
    </Box>
  );
};