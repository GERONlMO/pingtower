export type Endpoint = {
  id: string;
  url: string;
  status: 0 | 1 | 2 | 3;
};

// Типы данных в соответствии с DashboardServiceDto из бэкенда
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
  endpoints?: Endpoint[]; // эндпоинты для обратной совместимости
}

// Алиас для обратной совместимости
export type Service = DashboardService;

const SERVICE_NAMES = [
  { id: "svc-1", n: "Auth Service", e: "prod" },
  { id: "svc-2", n: "Billing", e: "prod" },
  { id: "svc-3", n: "Notification", e: "stage" },
  { id: "svc-4", n: "User Profile", e: "prod" },
  { id: "svc-5", n: "Order Service", e: "dev" },
  { id: "svc-6", n: "Inventory", e: "prod" },
  { id: "svc-7", n: "Analytics", e: "stage" },
  { id: "svc-8", n: "Search", e: "prod" },
  { id: "svc-9", n: "Recommendation", e: "dev" },
  { id: "svc-10", n: "Support", e: "prod" },
];

const STATUS_OPTIONS = ["UNKNOWN", "HEALTHY", "DEGRADED", "CRITICAL"];

const STATIC_ENDPOINTS: Endpoint[] = [
  { id: "ep-1", url: "/api/health", status: 1 },
  { id: "ep-2", url: "/api/ping", status: 1 },
  { id: "ep-3", url: "/api/info", status: 1 },
];

type Callback = (services: DashboardService[]) => void;

class MockSocket {
  private interval: number | null = null;
  private subscribers: Callback[] = [];
  private services: DashboardService[] = [];

  constructor() {
    this.services = SERVICE_NAMES.map((svc) => ({
      ...svc,
      st: STATUS_OPTIONS[1], // HEALTHY
      p95: 123.45,
      avg: 100.12,
      up: 99.9,
      ok: 150,
      dlt: 800,
      ttfb: 250,
      ssl: 45,
      lc: new Date().toISOString(),
      io: true,
      endpoints: STATIC_ENDPOINTS.map((ep) => ({
        ...ep,
        status: (Math.floor(Math.random() * 4)) as 0 | 1 | 2 | 3,
      })),
    }));
  }

  subscribe(cb: Callback) {
    this.subscribers.push(cb);
    cb(this.services);
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.services = SERVICE_NAMES.map((svc) => ({
          ...svc,
          st: STATUS_OPTIONS[Math.floor(Math.random() * 4)],
          p95: +(Math.random() * 1000).toFixed(2),
          avg: +(Math.random() * 800).toFixed(2),
          up: +(Math.random() * 100).toFixed(2),
          ok: Math.floor(Math.random() * 200) + 50,
          dlt: Math.floor(Math.random() * 1500) + 500,
          ttfb: Math.floor(Math.random() * 500) + 100,
          ssl: Math.floor(Math.random() * 90) + 10,
          lc: new Date().toISOString(),
          io: Math.random() > 0.1, // 90% онлайн
          endpoints: STATIC_ENDPOINTS.map((ep) => ({
            ...ep,
            status: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
          })),
        }));
        this.subscribers.forEach((cb) => cb(this.services));
      }, 3000);
    }
    return () => this.unsubscribe(cb);
  }

  unsubscribe(cb: Callback) {
    this.subscribers = this.subscribers.filter((f) => f !== cb);
    if (this.subscribers.length === 0 && this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  get() {
    return this.services;
  }

  post(service: DashboardService) {
    this.services = [...this.services, service];
    this.subscribers.forEach((cb) => cb(this.services));
  }

  patch(id: string, patch: Partial<DashboardService>) {
    this.services = this.services.map((svc) =>
      svc.id === id ? { ...svc, ...patch } : svc
    );
    this.subscribers.forEach((cb) => cb(this.services));
  }
}

export const mockSocket = new MockSocket();

// Функции для обратной совместимости
export function subscribeToServices(callback: Callback) {
  return mockSocket.subscribe(callback);
}

export function unsubscribeFromServices() {
  // Не требуется, т.к. отписка теперь через возвращаемую функцию
}

// Возвращает статистику по окружениям для графика
export function getEnvStats(services: DashboardService[]) {
  const envs = ['prod', 'stage', 'dev'];
  const stats = { prod: 0, stage: 0, dev: 0 };
  services.forEach(s => {
    if (envs.includes(s.e)) {
      stats[s.e as keyof typeof stats]++;
    }
  });
  return envs.map(e => ({ env: e, count: stats[e as keyof typeof stats] }));
}