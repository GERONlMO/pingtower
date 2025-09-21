import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { WebSocketStatus } from '@shared/ui';

interface DashboardHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  // WebSocket функции
  onConnect?: () => void;
  onDisconnect?: () => void;
  // WebSocket статус
  wsConnected?: boolean;
  wsConnecting?: boolean;
  wsError?: string | null;
  wsLastUpdated?: string | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  loading,
  onRefresh,
  onAdd,
  onConnect,
  onDisconnect,
  wsConnected = false,
  wsConnecting = false,
  wsError = null,
  wsLastUpdated = null,
}) => {
  onConnect &&
    useEffect(() => {
      onConnect();
    }, []);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" component="h1">
          🚀 Дашборд мониторинга сайтов
        </Typography>
        <WebSocketStatus
          isConnected={wsConnected}
          isConnecting={wsConnecting}
          error={wsError}
          lastUpdated={wsLastUpdated}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Обновить
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Добавить сайт
        </Button>
      </Box>
    </Box>
  );
};
