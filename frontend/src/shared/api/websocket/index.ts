export { useWebSocket } from './useWebSocket';
export type { 
  DashboardService, 
  WebSocketConfig, 
  WebSocketHookResult 
} from './types';

// Функции для обратной совместимости (будут удалены после полного перехода)
import type { DashboardService } from './types';

export type Service = DashboardService;

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