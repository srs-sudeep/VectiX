import { AppLogo, Button, Sheet, SheetContent, SheetTrigger } from '@/components';
import { getDashboardLink } from '@/lib/redirect';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { useTheme } from '@/theme';
import { ArrowRight, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { name: 'About us', href: 'about' },
  { name: 'Contact us', href: 'contact' },
  { name: 'Privacy Policies', href: 'privacy' },
  { name: 'Terms', href: 'terms' },
  { name: 'Support', href: 'support' },
];

export const LandingNavbar = () => {
  const location = useLocation();
  const { isAuthenticated, currentRole, logout } = useAuthStore();
  const { mode, toggleMode } = useTheme();
  const [scroll, setScroll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scroll
          ? 'bg-card/95 backdrop-blur-md shadow-lg border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link to="/" className="relative group">
          <AppLogo horizontal className="w-32 md:w-40 transition-transform duration-300 group-hover:scale-105" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map(link => {
            const isActive = location.pathname.includes(link.href);
            return (
              <Link
                key={link.name}
                to={`/${link.href}`}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent hover:bg-border border border-border transition-colors"
          >
            {mode === 'dark' ? (
              <Sun className="h-5 w-5 text-foreground/70" />
            ) : (
              <Moon className="h-5 w-5 text-foreground/70" />
            )}
          </button>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <Button asChild className="rounded-xl px-6 font-semibold">
                <Link to="/login" className="flex items-center gap-2">
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="rounded-xl px-5 font-medium border-border">
                  <Link to={getDashboardLink(currentRole)} className="flex items-center gap-2">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-xl px-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent hover:bg-border border border-border transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0 border-l border-border">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <AppLogo horizontal className="w-28" />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                  {navLinks.map(link => {
                    const isActive = location.pathname.includes(link.href);
                    return (
                      <Link
                        key={link.name}
                        to={`/${link.href}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <span>{link.name}</span>
                        <ArrowRight className={cn('h-4 w-4 transition-transform', isActive && 'translate-x-1')} />
                      </Link>
                    );
                  })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-border space-y-3">
                  {!isAuthenticated ? (
                    <Button asChild className="w-full rounded-xl font-semibold">
                      <Link to="/login" className="flex items-center justify-center gap-2">
                        Login
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="w-full rounded-xl font-medium">
                        <Link to={getDashboardLink(currentRole)} className="flex items-center justify-center gap-2">
                          Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
