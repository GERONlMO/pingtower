import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, ReduxProvider } from '@app/providers';
import { Header } from '@widgets/header';
import { Box } from '@mui/material';
import { AboutPage } from '@/pages';
import { DashboardPage } from '@/pages/dashboard';

function App() {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true}}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;
