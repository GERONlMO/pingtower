import React from "react";
import { Box, Chip, Typography, Tooltip, Fade } from "@mui/material";
import { usePersistentState } from "../model/hooks/usePersistentState";
import { StatusFilter, EnvFilter } from "../lib/types";

const statusLabels = [
  { label: "All", desc: "Показать все статусы" },
  { label: "OK", desc: "Только рабочие" },
  { label: "WARN", desc: "Есть предупреждения" },
  { label: "CRIT", desc: "Недоступные" },
];
const statusColors = ["default", "success", "warning", "error"];
const envLabels = [
  { label: "prod", color: "primary", desc: "Продакшн" },
  { label: "staging", color: "info", desc: "Стенд" },
  { label: "dev", color: "secondary", desc: "Разработка" },
];

export const SiteFilters: React.FC<{
  onChange: (filters: { status: StatusFilter[]; env: EnvFilter[] }) => void;
}> = ({ onChange }) => {
  // Теперь массивы для мультивыбора
  const [statusFilter, setStatusFilter] = usePersistentState<StatusFilter[]>(
    "statusFilter",
    []
  );
  const [envFilter, setEnvFilter] = usePersistentState<EnvFilter[]>(
    "envFilter",
    []
  );

  React.useEffect(() => {
    onChange({ status: statusFilter, env: envFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(statusFilter), JSON.stringify(envFilter)]);

  // Обработчик для статусов
  const handleStatusClick = (st: StatusFilter | null) => {
    if (st === null) {
      setStatusFilter([]);
    } else {
      setStatusFilter(
        Array.isArray(statusFilter)
          ? statusFilter.includes(st)
            ? statusFilter.filter((v) => v !== st)
            : [...statusFilter, st]
          : []
      );
    }
  };

  // Обработчик для env
  const handleEnvClick = (env: EnvFilter) => {
    setEnvFilter(
      Array.isArray(envFilter)
        ? envFilter.includes(env)
          ? envFilter.filter((v) => v !== env)
          : [...envFilter, env]
        : []
    );
  };

  // Проверка выбран ли статус
  const isStatusSelected = (st: StatusFilter | null) =>
    st === null
      ? Array.isArray(statusFilter) && statusFilter?.length === 0
      : Array.isArray(statusFilter) && statusFilter?.includes(st);

  // Проверка выбран ли env
  const isEnvSelected = (env: EnvFilter) =>
    Array.isArray(envFilter) && envFilter?.includes(env);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        mb: 2,
        flexWrap: "wrap",
        alignItems: "center",
        width: "100%",
        background: "#f7f7fa",
        borderRadius: 2,
        px: 2,
        py: 1,
        boxShadow: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ mr: 1, color: "text.secondary" }}>
        Статус:
      </Typography>
      {/* All - сбрасывает все статусы */}
      <Tooltip
        title={statusLabels[0].desc}
        arrow
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
      >
        <Chip
          label={statusLabels[0].label}
          color="default"
          variant={isStatusSelected(null) ? "filled" : "outlined"}
          onClick={() => handleStatusClick(null)}
          sx={{
            fontWeight: isStatusSelected(null) ? 700 : 400,
            fontSize: 16,
            px: 2,
            borderRadius: 2,
            boxShadow: isStatusSelected(null) ? 2 : 0,
            opacity: 1,
            transition: "all 0.15s",
            cursor: "pointer",
            minWidth: 60,
          }}
        />
      </Tooltip>
      {[1, 2, 3].map((st) => (
        <Tooltip
          key={st}
          title={statusLabels[st].desc}
          arrow
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 200 }}
        >
          <Chip
            label={statusLabels[st].label}
            color={statusColors[st] as any}
            variant={isStatusSelected(st) ? "filled" : "outlined"}
            onClick={() => handleStatusClick(st)}
            sx={{
              fontWeight: isStatusSelected(st) ? 700 : 400,
              fontSize: 16,
              px: 2,
              borderRadius: 2,
              boxShadow: isStatusSelected(st) ? 2 : 0,
              opacity: 1,
              transition: "all 0.15s",
              cursor: "pointer",
              minWidth: 60,
            }}
          />
        </Tooltip>
      ))}

      {(statusFilter?.length > 0 || envFilter?.length > 0) && (
        <Chip
          label="Сбросить фильтры"
          color="default"
          variant="outlined"
          onClick={() => {
            setStatusFilter([]);
            setEnvFilter([]);
          }}
          sx={{
            ml: 2,
            fontWeight: 500,
            fontSize: 15,
            px: 2,
            borderRadius: 2,
            cursor: "pointer",
            background: "#fff",
            borderColor: "#bbb",
          }}
        />
      )}
    </Box>
  );
};
