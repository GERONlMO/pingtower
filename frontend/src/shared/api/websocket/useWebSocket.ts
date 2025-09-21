import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
// @ts-ignore - sockjs-client не имеет типов
import SockJS from 'sockjs-client';
import { config } from '@shared/config/env';
import { DashboardService, WebSocketConfig, WebSocketHookResult } from './types';

const DEFAULT_CONFIG: WebSocketConfig = {
  url: config.api.wsUrl || 'http://localhost:8082/ws/dashboard',
  reconnectDelay: 5000,
  maxReconnectAttempts: 10,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
};

export const useWebSocket = (customConfig?: Partial<WebSocketConfig>): WebSocketHookResult => {
  const wsConfig = { ...DEFAULT_CONFIG, ...customConfig };

  const [services, setServices] = useState<DashboardService[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Функция подключения к WebSocket
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    const client = new Client({
      webSocketFactory: () => new SockJS(wsConfig.url),
      connectHeaders: {
        // Добавьте заголовки аутентификации если нужно
        // Authorization: `Bearer ${getToken()}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[WebSocket Debug]:', str);
        }
      },
      reconnectDelay: wsConfig.reconnectDelay,
      heartbeatIncoming: wsConfig.heartbeatIncoming,
      heartbeatOutgoing: wsConfig.heartbeatOutgoing,

      onConnect: () => {
        console.log('[WebSocket] Connected to server');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Subscribe to get the initial snapshot
        client.subscribe('/app/dashboard', (message) => {
          try {
            const snapshot = JSON.parse(message.body);
            console.log("Received snapshot:", snapshot);
            if (Array.isArray(snapshot)) {
              setServices(snapshot);
              setLastUpdated(new Date().toISOString());
            }
          } catch (err) {
            console.error('[WebSocket] Error parsing snapshot:', err);
            setError('Ошибка обработки данных с сервера');
          }
        });

        // Subscribe to get real-time updates
        client.subscribe('/topic/dashboard.update', (message) => {
          try {
            const updatedService = JSON.parse(message.body);
            console.log("Received update:", updatedService);
            setServices(prev =>
              prev.map(service =>
                service.id === updatedService.id ? updatedService : service
              )
            );
            setLastUpdated(new Date().toISOString());
          } catch (err) {
            console.error('[WebSocket] Error parsing update:', err);
          }
        });
      },

      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame);
        setError(`Ошибка STOMP: ${frame.headers?.message || 'Неизвестная ошибка'}`);
        setIsConnected(false);
        setIsConnecting(false);
        // Attempt to reconnect after delay
        setTimeout(() => connect(), wsConfig.reconnectDelay);
      },

      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket ошибка:', event);
        setError('Ошибка подключения WebSocket');
        setIsConnected(false);
        setIsConnecting(false);
      },

      onDisconnect: () => {
        console.log('[WebSocket] Disconnected from server');
        setIsConnected(false);
        setIsConnecting(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [wsConfig]);

  // Функция для запроса обновления данных
  const refresh = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/refresh',
        body: JSON.stringify({
          type: 'REFRESH_REQUEST',
          timestamp: new Date().toISOString()
        }),
      });
      console.log('[WebSocket] Отправлен запрос на обновление данных');
    } else {
      console.warn('[WebSocket] Не удается отправить запрос - нет подключения');
      setError('Нет подключения к серверу');
    }
  }, []);

  // Отключение от WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Эффект для очистки при размонтировании компонента
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    services,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    refresh,
    lastUpdated,
  };
};