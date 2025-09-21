import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Box, Typography, Paper } from "@mui/material";
import { OrbitControls } from "@react-three/drei";
import { DashboardService } from "@shared/api/websocket";

const statusColor = ["#888888", "#4caf50", "#ff9800", "#f44336"];

function getStatusCode(isOnline: boolean): number {
  return isOnline ? 1 : 3; // 1 = HEALTHY (зеленый), 3 = CRITICAL (красный)
}

function getRandomPosition(): [number, number, number] {
  return [
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
  ];
}

const SitePoint: React.FC<{
  color: string;
  position: [number, number, number];
  site: DashboardService;
  onClick: () => void;
}> = ({ color, position, site: _site, onClick }) => (
  <mesh
    position={position}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <sphereGeometry args={[2, 64, 64]} />
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.6}
      roughness={0.3}
      metalness={0.7}
    />
  </mesh>
);

export const SitesSpace: React.FC<{ sites: DashboardService[] }> = ({ sites }) => {
  const positionsRef = useRef<Record<string, [number, number, number]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  sites.forEach((s) => {
    if (!positionsRef.current[s.id]) {
      positionsRef.current[s.id] = getRandomPosition();
    }
  });

  const points = sites.map((s) => ({
    color: statusColor[getStatusCode(s.io)],
    position: positionsRef.current[s.id],
    key: s.id,
    site: s,
  }));

  const handlePointClick = (site: DashboardService) => {
    setSelectedId(site.id);
  };

  const selectedSite = selectedId
    ? sites.find((s) => s.id === selectedId)
    : null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 300, sm: 400, md: 500, lg: 600 },
        minHeight: 200,
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 0, 120], fov: 75 }}
      >
        <color attach="background" args={["rgba(7, 7, 27, 1)"]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.6} />
        {points.map((p) => (
          <SitePoint
            key={p.key}
            color={p.color}
            position={p.position}
            site={p.site}
            onClick={() => handlePointClick(p.site)}
          />
        ))}
        <OrbitControls />
      </Canvas>

      {selectedSite && (
        <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
          <Paper
            elevation={6}
            sx={{
              px: 3,
              py: 2,
              minWidth: 150,
              maxWidth: 400,
              minHeight: 150,
              opacity: 0.98,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {selectedSite.id}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              URL: {selectedSite.n}
            </Typography>
            <Typography variant="body1">Статус: {selectedSite.st}</Typography>
            <Typography variant="body1">
              Среднее время отклика: {selectedSite.avg || 'N/A'}ms
            </Typography>
            <Typography variant="body1">
              Онлайн: {selectedSite.io ? 'Да' : 'Нет'}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
