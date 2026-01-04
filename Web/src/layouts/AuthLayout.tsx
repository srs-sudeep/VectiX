import { AppLogo, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components';
import { useTheme } from '@/theme';
import { Moon, Sun } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="relative flex items-center justify-center w-screen h-screen min-h-screen bg-background overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 w-full h-full pointer-events-none gradient-mesh" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-20">
        <AppLogo horizontal className="h-8 hover:opacity-80 transition-opacity cursor-pointer" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMode}
              className="w-10 h-10 rounded-xl border-border bg-card hover:bg-accent"
            >
              {mode === 'dark' ? (
                <Sun className="h-5 w-5 text-foreground/70" />
              ) : (
                <Moon className="h-5 w-5 text-foreground/70" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-muted-foreground z-10">
        <p>© {new Date().getFullYear()} <span className="font-semibold text-foreground">VectiX</span>. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
