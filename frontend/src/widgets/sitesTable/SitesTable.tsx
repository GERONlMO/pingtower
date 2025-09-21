import React, { useState, useMemo } from "react";
import { Paper, Box, Typography, TextField, Button, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridColumnResizeParams } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import { SiteDto } from "@shared/types";
import { AddSiteModal } from "@features/addSite/AddSiteModal";
import { DashboardService } from "@shared/api/websocket";

interface SitesTableProps {
  sites: Array<DashboardService>;
  columns: GridColDef[];
  loading: boolean;
  error?: string | null;
  updatedAt?: string;
  onColumnWidthChange?: (params: GridColumnResizeParams) => void;
}

export const SitesTable: React.FC<SitesTableProps> = ({
  sites,
  columns,
  loading,
  error,
  updatedAt,
  onColumnWidthChange,
}) => {
  const [search, setSearch] = useState("");
  const storageKey = "sitesTableColumnVisibility";
  const getInitialVisibility = (): GridColumnVisibilityModel => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(getInitialVisibility);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteDto | null>(null);

  const filteredSites = useMemo(
    () =>
      sites.filter(
        (s) =>
          s.n?.toLowerCase().includes(search.toLowerCase()) ||
          s.id?.toLowerCase().includes(search.toLowerCase())
      ),
    [sites, search]
  );

  const handleColumnVisibilityChange = (model: GridColumnVisibilityModel) => {
    setColumnVisibilityModel(model);
    localStorage.setItem(storageKey, JSON.stringify(model));
  };

  const handleRestoreColumns = () => {
    const allVisible: GridColumnVisibilityModel = {};
    columns.forEach((col) => {
      allVisible[col.field] = true;
    });
    setColumnVisibilityModel(allVisible);
    localStorage.setItem(storageKey, JSON.stringify(allVisible));
  };

  const columnsWithEdit: GridColDef[] = React.useMemo(() => {
    const hasActions = columns.some((col) => col.field === "actions");
    if (hasActions) return columns;
    return [
      ...columns,
      {
        field: "actions",
        headerName: "Действия",
        width: 100,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
          <IconButton
            size="small"
            onClick={() => {
              setEditingSite(params.row as SiteDto);
              setEditModalOpen(true);
            }}
          >
            <EditIcon />
          </IconButton>
        ),
      },
    ];
  }, [columns]);

  return (
    <Paper sx={{ height: '100%', width: "100%", minWidth: 0, position: "relative", display: 'flex', flexDirection: 'column' }}>
      {updatedAt && (
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: 8,
            right: 16,
            zIndex: 1,
            color: "text.secondary",
          }}
        >
          Актуально на: {new Date(updatedAt).toLocaleString()}
        </Typography>
      )}
      <Box sx={{ p: 2, pb: 0, display: "flex", gap: 2 }}>
        <TextField
          label="Поиск по сайту"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
        />
        <Button
          variant="outlined"
          onClick={handleRestoreColumns}
          sx={{ whiteSpace: "nowrap", minWidth: 180 }}
        >
          Восстановить все столбцы
        </Button>
      </Box>
      <DataGrid
        rows={filteredSites}
        columns={columnsWithEdit}
        loading={loading}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
        onColumnWidthChange={onColumnWidthChange}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        hideFooterPagination
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
        }}
      />
      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}
      <AddSiteModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSite(null);
        }}
        site={editingSite}
      />
    </Paper>
  );
};