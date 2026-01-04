import { Button } from '@/components';
import { useTheme } from '@/theme';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorLayoutProps {
  children: React.ReactNode;
}

const ErrorLayout = ({ children }: ErrorLayoutProps) => {
  const { mode, toggleMode } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 flex justify-end">
        <button
          onClick={toggleMode}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-border/50 bg-card hover:bg-accent transition-colors"
        >
          {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
        {children}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="default" className="rounded-xl">
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </main>
      <footer className="text-center text-sm text-muted-foreground p-4">
        © {new Date().getFullYear()} VectiX. All rights reserved.
      </footer>
    </div>
  );
};

export default ErrorLayout;
