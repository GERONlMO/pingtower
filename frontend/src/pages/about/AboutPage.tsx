import React from 'react';
import { Container, Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import { Button } from '@shared/ui';

export const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          About This Project
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Technology Stack
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Frontend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • React 18 with TypeScript<br/>
                    • Vite for fast development<br/>
                    • Material-UI for components<br/>
                    • React Router for navigation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Architecture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Feature-Sliced Design<br/>
                    • Modular structure<br/>
                    • Path aliases for imports<br/>
                    • TypeScript strict mode
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="outlined" size="large">
            Learn More
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
