import { AppLogo, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components';
import { useTheme } from '@/theme';
import { Moon, Sun } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="relative flex items-center justify-center w-screen h-screen min-h-screen bg-background overflow-hidden">
      {/* Subtle Gradient Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
        <AppLogo horizontal className="h-8" />
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMode}
              className="w-10 h-10 rounded-xl"
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Theme</TooltipContent>
        </Tooltip>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VectiX. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
