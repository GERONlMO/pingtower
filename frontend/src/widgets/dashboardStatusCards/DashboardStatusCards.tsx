import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";

interface DashboardStatusCardsProps {
  total: number;
  healthy: number;
  degraded: number;
  down: number;
}

export const DashboardStatusCards: React.FC<DashboardStatusCardsProps> = ({
  total,
  healthy,
  degraded,
  down,
}) => (
  <Box
    sx={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      mb: 3,
    }}
  >
    <Grid
      container
      spacing={4}
      columns={4}
      sx={{
        width: "100%",
        justifyContent: "center",
      }}
    >
      {[
        { label: "Total Sites", value: total, color: undefined },
        { label: "Healthy", value: healthy, color: "success.main" },
        { label: "Degraded", value: degraded, color: "warning.main" },
        { label: "Down", value: down, color: "error.main" },
      ].map((item) => (
        <Grid
          key={item.label}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 180,
              px: 2,
            }}
          >
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <Typography
                color="textSecondary"
                gutterBottom
                align="center"
                variant="body2"
              >
                {item.label}
              </Typography>
              <Typography
                variant="h4"
                color={item.color}
                sx={{ flex: 1, fontWeight: 600 }}
                align="center"
              >
                {item.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);
