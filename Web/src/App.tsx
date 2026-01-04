import { Toaster, TooltipProvider, TypographyProvider } from '@/components';
import { Toaster as Sonner } from '@/components/ui/sonner';
import Router from '@/routes';
import { ThemeProvider } from '@/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, HashRouter } from 'react-router-dom';

// Extend the Window interface to include 'electron'
declare global {
  interface Window {
    electron?: unknown;
  }
}

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 0,
      },
    },
  });

  // Check if running in Electron
  const isElectron = import.meta.env.VITE_IS_ELECTRON === 'true';
  const RouterComponent = isElectron ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <TypographyProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RouterComponent>
                <Router />
              </RouterComponent>
            </TooltipProvider>
          </TypographyProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
