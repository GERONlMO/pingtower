// Типы для WebSocket соединения
export interface DashboardService {
  id: string;          // ID сервиса
  n: string;           // name (название сервиса)
  e: string;           // environment (Категория)
  st: string;          // status (статус сервиса)
  p95: number;         // 95-й перцентиль латентности
  avg: number;         // средняя латентность
  up: number;          // процент uptime
  ok: number;          // количество успешных проверок
  dlt?: number;        // DOM Load Time (время загрузки DOM)
  ttfb?: number;       // Time to First Byte
  ssl?: number;        // SSL Expires In Days (дней до истечения SSL)
  lc: string;          // lastCheck (время последней проверки) - ISO string
  io: boolean;         // is_online (онлайн ли сервис)
}

export interface WebSocketMessage {
  type: 'SNAPSHOT' | 'UPDATE' | 'ERROR';
  data: DashboardService[] | DashboardService | string;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  heartbeatIncoming: number;
  heartbeatOutgoing: number;
}

export interface WebSocketHookResult {
  services: DashboardService[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  refresh: () => void;
  lastUpdated: string | null;
}