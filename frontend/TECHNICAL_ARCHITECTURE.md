# Техническое обоснование фронтенд-архитектуры PingTower

## 1. Обзор проекта

PingTower - это система мониторинга сайтов и сервисов в реальном времени, предоставляющая дашборд для отслеживания состояния, производительности и доступности веб-приложений.

## 2. Технологический стек

### 2.1. Основной стек

| Компонент | Технология | Версия | Обоснование |
|-----------|------------|--------|-------------|
| **Фреймворк** | React | 19.x | Современный, декларативный подход к построению UI. Отличная экосистема, производительность, виртуальный DOM |
| **Язык** | TypeScript | 5.x | Строгая типизация, улучшение DX, предотвращение runtime ошибок |
| **Сборщик** | Vite | 5.x | Быстрая сборка, HMR, оптимизированный dev server, современные ES модули |
| **Стилизация** | Material-UI (MUI) | 5.x | Богатый набор компонентов, дизайн-система, accessibility, кастомизация тем |
| **Управление состоянием** | Redux Toolkit | 2.x | Предсказуемое управление состоянием, middleware, devtools, TypeScript support |

### 2.2. HTTP-клиент и API

| Компонент | Технология | Обоснование |
|-----------|------------|-------------|
| **HTTP-клиент** | Axios | Перехватчики запросов, автоматическая сериализация, обработка ошибок |
| **WebSocket** | STOMP over SockJS | Протокол для real-time коммуникации, fallback через HTTP |

### 2.3. Архитектурные паттерны

| Паттерн | Реализация | Обоснование |
|---------|------------|-------------|
| **FSD (Feature-Sliced Design)** | Кастомная структура | Разделение по бизнес-логике, масштабируемость, переиспользование |
| **Atomic Design** | Компоненты UI | Гранулярность, переиспользование, консистентность |
| **Container/Presentational** | Разделение логики и представления | Тестируемость, переиспользование, разделение ответственности |

## 3. Архитектура приложения

### 3.1. Структура проекта (FSD)

```
src/
├── app/                    # Слой приложения
│   ├── App.tsx            # Главный компонент
│   ├── providers/         # Провайдеры (Redux, Theme)
│   └── store/             # Конфигурация Redux store
├── pages/                 # Страницы приложения
│   └── dashboard/         # Страница дашборда
├── widgets/               # Комплексные UI блоки
│   ├── dashboardHeader/   # Шапка дашборда
│   ├── sitesTable/        # Таблица сайтов
│   └── dashboardStatusCards/ # Карточки статуса
├── features/              # Бизнес-функционал
│   ├── addSite/          # Добавление сайта
│   └── siteFilters/      # Фильтры сайтов
├── entities/              # Бизнес-сущности
│   └── site/             # Сущность "Сайт"
├── shared/                # Переиспользуемый код
│   ├── api/              # API клиенты
│   ├── config/           # Конфигурация
│   ├── lib/              # Утилиты
│   ├── types/            # Типы TypeScript
│   └── ui/               # UI компоненты
```

### 3.2. Слои FSD

#### App Layer (Приложение)
- **Назначение**: Инициализация приложения, глобальные провайдеры
- **Компоненты**: App.tsx, ReduxProvider, ThemeProvider
- **Обоснование**: Централизованная конфигурация, dependency injection

#### Pages Layer (Страницы)
- **Назначение**: Корневые компоненты маршрутов
- **Компоненты**: DashboardPage, AboutPage
- **Обоснование**: Единицы навигации, композиция виджетов

#### Widgets Layer (Виджеты)
- **Назначение**: Крупные UI блоки с бизнес-логикой
- **Компоненты**: DashboardHeader, SitesTable, SitesSpace
- **Обоснование**: Переиспользуемые блоки, инкапсуляция логики

#### Features Layer (Функции)
- **Назначение**: Бизнес-функционал, фичи
- **Компоненты**: AddSiteModal, SiteFilters
- **Обоснование**: Группировка по бизнес-ценности, независимость

#### Entities Layer (Сущности)
- **Назначение**: Бизнес-сущности и их логика
- **Компоненты**: siteSlice, selectors
- **Обоснование**: Централизация бизнес-логики, нормализация данных

#### Shared Layer (Общее)
- **Назначение**: Переиспользуемый код
- **Компоненты**: API клиенты, утилиты, базовые UI компоненты
- **Обоснование**: DRY принцип, консистентность

## 4. Управление состоянием

### 4.1. Redux Toolkit

```typescript
// Пример slice
export const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    // Синхронные действия
  },
  extraReducers: (builder) => {
    // Асинхронные действия (thunks)
  }
});
```

**Обоснование выбора Redux Toolkit:**
- Упрощенная boilerplate по сравнению с vanilla Redux
- Встроенная поддержка TypeScript
- Immer для immutable updates
- RTK Query для API интеграции (опционально)

### 4.2. WebSocket состояние

```typescript
export const useWebSocket = (): WebSocketHookResult => {
  // Реактивное состояние подключения
  const [isConnected, setIsConnected] = useState(false);
  const [services, setServices] = useState<DashboardService[]>([]);

  // Логика подключения через STOMP
};
```

**Обоснование:**
- Real-time обновления без polling
- STOMP протокол для структурированных сообщений
- Автоматическое переподключение

## 5. API интеграция

### 5.1. HTTP клиент

```typescript
// Axios конфигурация
export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: 10000,
});

// Перехватчики для обработки ошибок
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Централизованная обработка ошибок
    return Promise.reject(error);
  }
);
```

### 5.2. WebSocket клиент

```typescript
const client = new Client({
  webSocketFactory: () => new SockJS(wsUrl),
  // STOMP конфигурация
  onConnect: () => {
    client.subscribe('/app/dashboard', handleSnapshot);
    client.subscribe('/topic/dashboard.update', handleUpdate);
  }
});
```

## 6. UI/UX архитектура

### 6.1. Material-UI система

```typescript
// Кастомная тема
export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    // Кастомные цвета и настройки
  },
  components: {
    // Переопределение компонентов
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    }
  }
});
```

**Преимущества:**
- Accessibility (WCAG 2.1)
- Responsive design
- Темизация
- Rich компонентная база

### 6.2. Адаптивный дизайн

- **Grid система**: Material-UI Grid для responsive layout
- **Breakpoint'ы**: xs, sm, md, lg, xl
- **Mobile-first**: Подход к разработке

## 7. Производительность

### 7.1. Оптимизации React

- **React.memo**: Предотвращение лишних ре-рендеров
- **useMemo/useCallback**: Мемоизация вычислений и функций
- **Lazy loading**: Динамический импорт компонентов

### 7.2. Vite оптимизации

- **Tree shaking**: Удаление неиспользуемого кода
- **Code splitting**: Разделение бандла
- **ES модули**: Современный формат модулей

### 7.3. Кэширование

- **Redux state**: Нормализованное состояние
- **React Query**: Кэширование API запросов (опционально)
- **LocalStorage**: Персистентные настройки (ширина колонок)

## 8. Качество кода

### 8.1. TypeScript

- **Строгая типизация**: Предотвращение runtime ошибок
- **Интерфейсы**: Типизация API, компонентов, состояния
- **Generic types**: Переиспользуемые типы

### 8.2. Тестирование

```typescript
// Структура тестов
describe('DashboardPage', () => {
  it('renders loading state', () => {
    // Тесты компонентов
  });
});

describe('useWebSocket', () => {
  it('connects to WebSocket', () => {
    // Тесты хуков
  });
});
```

### 8.3. Линтинг и форматирование

- **ESLint**: Статический анализ кода
- **Prettier**: Автоматическое форматирование
- **Husky**: Pre-commit хуки

## 9. DevOps и развертывание

### 9.1. Сборка и развертывание

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest"
  }
}
```

### 9.2. Конфигурация окружений

```typescript
// env.ts
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/dashboard',
  },
  dev: {
    isDev: import.meta.env.DEV,
    useMockApi: import.meta.env.VITE_MOCK_API === 'true',
  },
};
```

## 10. Масштабируемость и поддержка

### 10.1. Модульная архитектура

- **FSD**: Легкое добавление новых фич
- **Shared слой**: Переиспользуемые компоненты
- **Feature isolation**: Независимость модулей

### 10.2. Поддержка командной разработки

- **Согласованная структура**: Понятная организация кода
- **TypeScript**: Улучшенная DX и autocomplete
- **Документация**: README, код-комментарии

## 11. Риски и mitigation

| Риск | Вероятность | Воздействие | Mitigation |
|------|-------------|-------------|------------|
| **WebSocket соединение** | Средняя | Высокое | Fallback на polling, автоматическое переподключение |
| **Browser compatibility** | Низкая | Среднее | Polyfills, progressive enhancement |
| **Bundle size** | Средняя | Среднее | Code splitting, tree shaking, lazy loading |
| **TypeScript complexity** | Средняя | Низкое | Строгие правила типизации, обучение команды |

## 12. Заключение

Выбранный стек технологий обеспечивает:
- **Производительность**: Vite, React 19, оптимизации
- **Масштабируемость**: FSD архитектура, модульность
- **Поддерживаемость**: TypeScript, линтинг, тестирование
- **Пользовательский опыт**: Material-UI, real-time обновления
- **Командную разработку**: Стандарты, документация

Архитектура готова к росту проекта и добавлению новых функций.</content>