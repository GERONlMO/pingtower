import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Typography, Box, Button, Chip, IconButton, Alert } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GridColDef, GridColumnResizeParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { AddSiteModal } from "@features/addSite";
import {
  fetchSites,
  selectSitesLoading,
  selectSitesError,
} from "@entities/site";
import { AppDispatch } from "@app/store";
import { SiteDto } from "@shared/types";
import { DashboardHeader } from "@/widgets/dashboardHeader/DashboardHeader";
import { DashboardStatusCards } from "@/widgets/dashboardStatusCards/DashboardStatusCards";
import { SitesTable } from "@/widgets/sitesTable/SitesTable";
import { useWebSocket, DashboardService } from "@/shared/api/websocket";
import { SitesSpace } from "@/widgets/sitesSpace/SitesSpace";
import { SiteFilters } from "@/features/siteFilters/ui/SiteFilters";

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteDto | null>(null);

  const loading = useSelector(selectSitesLoading);
  const error = useSelector(selectSitesError);

  // Используем реальный WebSocket вместо мок-сокета
  const {
    services: wsServices,
    isConnected,
    isConnecting,
    error: wsError,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    refresh: refreshWebSocket,
    lastUpdated,
  } = useWebSocket();

  const [visibleServices, setVisibleServices] = useState<DashboardService[]>([]);

  // Обновляем локальное состояние при получении данных из WebSocket
  useEffect(() => {
    setVisibleServices(wsServices);
  }, [wsServices]);

  // Подсчёт статусов из WebSocket данных (по онлайн-статусу)
  const wsHealthyCount = visibleServices.filter(s => s.io).length; // Онлайн сервисы
  const wsDegradedCount = 0; // Пока не используется
  const wsDownCount = visibleServices.filter(s => !s.io).length; // Не онлайн сервисы

  const handleRefresh = () => {
    // Обновляем и Redux состояние, и WebSocket данные
    dispatch(fetchSites());
    refreshWebSocket();
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditingSite(null);
  };

  // Новый тип фильтров для мультивыбора
  const [filters, setFilters] = useState<{
    status: number[];
    env: string[];
  }>({
    status: [],
    env: [],
  });

  // Фильтрация с учётом массивов
  const filteredServices = visibleServices.filter((s) => {
    const statusOk = !filters.status?.length || filters.status.includes(s.io ? 1 : 3);
    const envOk = !filters.env?.length || filters.env.includes(s.e);
    return statusOk && envOk;
  });


  // Состояние для раскрытия подсписка эндпоинтов
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleExpandClick = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("dashboardTableColumnWidths");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleColumnWidthChange = (params: GridColumnResizeParams) => {
    const newWidths = { ...columnWidths, [params.colDef.field]: params.width };
    setColumnWidths(newWidths);
    localStorage.setItem("dashboardTableColumnWidths", JSON.stringify(newWidths));
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: "expand",
      headerName: "",
      width: columnWidths["expand"] || 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        params.row.endpoints && params.row.endpoints.length > 0 ? (
          <IconButton
            size="small"
            onClick={() => handleExpandClick(params.row.id)}
            aria-label="expand row"
          >
            {expandedRows[params.row.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        ) : null
      ),
    },
    {
      field: "n",
      headerName: "Название",
      width: columnWidths["n"] || 200,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => navigate(`/services/${params.row.id}`)}
          sx={{ textAlign: "left", justifyContent: "flex-start" }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "e",
      headerName: "Категория",
      width: columnWidths["e"] || 100,
      renderCell: (params) => (
        <Typography variant="body2" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "st",
      headerName: "Статус",
      width: columnWidths["st"] || 120,
      renderCell: (params) => {
        // Определяем статус по полю io (is_online)
        const isOnline = params.row.io;
        const statusText = isOnline ? "OK" : "CRIT";
        const statusColor = isOnline ? "success" : "error";

        return <Chip label={statusText} color={statusColor} size="small" />;
      },
    },
    {
      field: "p95",
      headerName: "P95 (мс)",
      width: columnWidths["p95"] || 110,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">{params.value?.toFixed(2)}</Typography>
      ),
    },
    {
      field: "avg",
      headerName: "Среднее (мс)",
      width: columnWidths["avg"] || 110,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">{params.value?.toFixed(2)}</Typography>
      ),
    },
    {
      field: "up",
      headerName: "Аптайм (%)",
      width: columnWidths["up"] || 110,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">{params.value?.toFixed(2)}%</Typography>
      ),
    },
    {
      field: "ok",
      headerName: "Успешных проверок",
      width: columnWidths["ok"] || 130,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">{params.value || 0}</Typography>
      ),
    },
    {
      field: "dlt", 
      headerName: "DOM Load Time",
      width: columnWidths["dlt"] || 130,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value}ms` : 'N/A'}
        </Typography>
      ),
    },
    {
      field: "ttfb",
      headerName: "TTFB", 
      width: columnWidths["ttfb"] || 100,
      type: "number",
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? `${params.value}ms` : 'N/A'}
        </Typography>
      ),
    },
    {
      field: "ssl",
      headerName: "SSL (дней)",
      width: columnWidths["ssl"] || 110, 
      type: "number",
      renderCell: (params) => (
        <Typography 
          variant="body2"
          color={params.value && params.value < 30 ? 'warning.main' : 'text.primary'}
        >
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: "io",
      headerName: "Онлайн",
      width: columnWidths["io"] || 90,
      renderCell: (params) => (
        <Chip 
          label={params.value ? "Да" : "Нет"}
          color={params.value ? "success" : "error"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "lc",
      headerName: "Последняя проверка",
      width: columnWidths["lc"] || 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value ? new Date(params.value).toLocaleString("ru-RU") : "Никогда"}
        </Typography>
      ),
    },
  ], [columnWidths, expandedRows, navigate]); // Добавляем columnWidths в зависимости

  return (
    <Container maxWidth={false} sx={{ width: "100%", maxWidth: "2000px !important" }}>
      <Box sx={{ my: 4, width: "100%" }}>
        <DashboardHeader
          loading={loading || isConnecting}
          onRefresh={handleRefresh}
          onAdd={() => setAddModalOpen(true)}
          onConnect={connectWebSocket}
          onDisconnect={disconnectWebSocket}
          wsConnected={isConnected}
          wsConnecting={isConnecting}
          wsError={wsError}
          wsLastUpdated={lastUpdated}
        />

        {/* Статус WebSocket подключения */}
        {!isConnected && !isConnecting && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Нет подключения к серверу. Данные могут быть неактуальными.
          </Alert>
        )}

        {wsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ошибка WebSocket: {wsError}
          </Alert>
        )}

        {isConnected && lastUpdated && (
          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Последнее обновление: {new Date(lastUpdated).toLocaleString('ru-RU')}
            </Typography>
          </Box>
        )}

        <DashboardStatusCards
          total={visibleServices.length}
          healthy={wsHealthyCount}
          degraded={wsDegradedCount}
          down={wsDownCount}
        />

        <SiteFilters
          onChange={(f) =>
            setFilters({
              status: (f.status as (number | null)[]).filter((v): v is number => typeof v === "number"),
              env: (f.env as (string | null)[]).filter((v): v is string => typeof v === "string"),
            })
          }
        />

        <Box sx={{ minHeight: 400, mb: 4 }}>
          <SitesSpace sites={filteredServices} />
        </Box>

        <SitesTable
          sites={visibleServices}
          columns={columns}
          loading={loading}
          error={error}
          onColumnWidthChange={handleColumnWidthChange} 
        />

        {error && (
          <Box sx={{ mt: 2 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        <AddSiteModal
          open={addModalOpen}
          onClose={handleCloseModal}
          site={editingSite}
        />
      </Box>
    </Container>
  );
};
