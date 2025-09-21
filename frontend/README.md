# 🚀 PingTower - Site Monitoring Dashboard

Веб-приложение для мониторинга сайтов с использованием Feature-Sliced Design архитектуры, React, Vite и Material-UI.

## 📊 Статус разработки

### ✅ Завершено (Фазы 1-3):
- **Фаза 1**: Настройка инфраструктуры и базовых типов
- **Фаза 2**: API слой и mock сервер (MSW)
- **Фаза 3**: Shared компоненты и утилиты

### 🔄 В разработке:
- **Фаза 4**: Entities (Site, Check, Result)
- **Фаза 5**: Features (CRUD операции)

### 📋 Планируется:
- **Фаза 6**: Widgets (таблицы, графики)
- **Фаза 7**: Pages (Dashboard, Details)
- **Фаза 8**: WebSocket интеграция
- **Фаза 9**: Полировка и тестирование

## 🛠 Технологии

- **React 18** + **TypeScript** - современный фронтенд
- **Vite** - быстрый инструмент сборки
- **Material-UI** - библиотека компонентов
- **React Router** - маршрутизация
- **MSW** - mock сервер для разработки
- **Recharts** - графики и визуализация данных
- **Axios** - HTTP клиент

## 🏗 Архитектура

Проект следует методологии Feature-Sliced Design (FSD):

```
src/
├── app/           # Инициализация приложения, провайдеры
├── pages/         # Страницы приложения
├── widgets/       # Композитные UI блоки
├── features/      # Бизнес-функции
├── entities/      # Бизнес-сущности
└── shared/        # Переиспользуемый код
    ├── ui/        # UI компоненты (Button, StatusChip, Sparkline, etc.)
    ├── lib/       # Утилиты и хелперы (date, validation, utils)
    ├── api/       # API слой (sites, checks, results, reports)
    ├── types/     # TypeScript типы
    └── config/    # Конфигурация
```

## 🎨 Готовые компоненты

### Shared UI:
- **Button** - кастомная кнопка с вариантами
- **StatusChip** - индикатор статуса (GREEN/YELLOW/RED)
- **Sparkline** - мини-график для отображения трендов
- **Toast** - система уведомлений
- **LoadingSpinner/LoadingSkeleton** - компоненты загрузки
- **FormTextField/FormSelect/FormCheckbox** - формы
- **Modal** - модальные окна

### API слой:
- **Sites API** - CRUD операции для сайтов
- **Checks API** - управление проверками
- **Results API** - получение результатов
- **Reports API** - экспорт отчетов
- **Mock сервер** - MSW для разработки

## 🚀 Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите проект в режиме разработки:
```bash
npm run dev
```

3. Откройте браузер: `http://localhost:5173`

4. Соберите проект для продакшена:
```bash
npm run build
```

## 📁 Структура проекта

- `src/app/` - инициализация приложения, провайдеры тем
- `src/pages/` - страницы приложения (Home, About)
- `src/widgets/` - виджеты (Header)
- `src/shared/ui/` - переиспользуемые UI компоненты
- `src/shared/api/` - API клиент и mock сервер
- `src/shared/lib/` - утилиты (даты, валидация, форматирование)
- `src/shared/types/` - TypeScript интерфейсы
- `src/features/` - бизнес-функции (готово для расширения)
- `src/entities/` - бизнес-сущности (готово для расширения)

## 🔗 Алиасы путей

Проект настроен с алиасами для удобного импорта:

- `@app/*` - app слой
- `@pages/*` - pages слой
- `@widgets/*` - widgets слой
- `@features/*` - features слой
- `@entities/*` - entities слой
- `@shared/*` - shared слой

## � Docker

### Сборка и запуск с Docker Compose

1. Соберите и запустите контейнер:
```bash
docker-compose up --build
```

2. Откройте браузер: `http://localhost:3000`

### Ручная сборка Docker образа

1. Соберите образ:
```bash
docker build -t pingtower-frontend .
```

2. Запустите контейнер:
```bash
docker run -p 3000:80 pingtower-frontend
```

### Структура Docker файлов

- `Dockerfile` - multi-stage сборка (Node.js → Nginx)
- `nginx.conf` - конфигурация nginx для SPA
- `docker-compose.yml` - оркестрация с healthcheck
- `.dockerignore` - исключение ненужных файлов

## �📋 Roadmap

Подробный план разработки доступен в файле [ROADMAP.md](./ROADMAP.md)

## 🎯 Цели проекта

Создание полнофункционального приложения для мониторинга сайтов с:
- Real-time обновлениями через WebSocket
- Интуитивным интерфейсом
- Экспортом отчетов
- Масштабируемой архитектурой
