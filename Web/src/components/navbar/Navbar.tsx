import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  LoadingFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchPanel,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  UserAvatar,
  useToast,
} from '@/components';
import { useSidebar } from '@/core';
import { useIsMobile } from '@/hooks';
import { getDashboardLink } from '@/lib/redirect';
import { useAuthStore } from '@/store';
import { useTheme } from '@/theme';
import { notifications, UserRole } from '@/types';
import { Bell, ChevronDown, HelpCircle, LogOut, Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, setCurrentRole, currentRole } = useAuthStore();
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const { mode, toggleMode } = useTheme();
  
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleChange = async (role: UserRole) => {
    if (currentRole === role) return;
    try {
      setIsChangingRole(true);
      setShowLoader(true);
      setCurrentRole(role);
      navigate(getDashboardLink(role));
      toast({
        title: 'Role Changed',
        description: `Switched to ${role} role.`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to switch roles.',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => {
        setIsChangingRole(false);
        setShowLoader(false);
      }, 800);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isMobile) {
    return (
      <>
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-4">
            <button 
              onClick={toggleSidebar} 
              className="p-2 -ml-2 rounded-xl hover:bg-accent transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-accent transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <button 
                onClick={toggleMode}
                className="p-2 rounded-xl hover:bg-accent transition-colors"
              >
                {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Drawer direction="bottom">
                <DrawerTrigger asChild>
                  <button className="p-1 rounded-full">
                    <UserAvatar name={user?.name || 'User'} role={currentRole || ''} showInfo={false} />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="rounded-t-3xl">
                  <DrawerHeader className="pb-2">
                    <DrawerTitle>Quick Menu</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-2xl">
                      <UserAvatar name={user?.name || 'User'} role={currentRole || ''} showInfo={false} className="h-12 w-12" />
                      <div>
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{currentRole}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors text-left">
                        <HelpCircle className="h-5 w-5" />
                        <span>Help & Support</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
        <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </>
    );
  }

  return (
    <>
      {showLoader && <LoadingFallback />}

      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between h-20 px-6">
          {/* Left - Greeting */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of your tasks, monitor progress, and track status.
            </p>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product"
                className="w-64 pl-10 h-11 bg-background border-border/50 rounded-full focus-visible:ring-primary/20"
                onClick={() => setIsSearchOpen(true)}
                readOnly
              />
            </div>

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleMode}
                  className="flex items-center justify-center w-11 h-11 rounded-full border border-border/50 bg-background hover:bg-accent transition-colors"
                >
                  {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative flex items-center justify-center w-11 h-11 rounded-full border border-border/50 bg-background hover:bg-accent transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl border-border/50" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="font-semibold">Notifications</h3>
                  <button className="text-xs text-primary hover:underline">Mark all as read</button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border/50">
                  <button className="w-full py-2 text-sm text-center text-primary hover:bg-accent rounded-lg transition-colors">
                    View all notifications
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-border/50 bg-background hover:bg-accent transition-colors">
                  <UserAvatar name={user?.name || 'User'} role={currentRole || ''} showInfo={false} className="h-8 w-8" />
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 rounded-2xl border-border/50 p-2" align="end">
                <div className="flex items-center gap-3 p-2 mb-2 bg-accent/50 rounded-xl">
                  <UserAvatar name={user?.name || 'User'} role={currentRole || ''} showInfo={false} className="h-10 w-10" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentRole}</p>
                  </div>
                </div>

                {user?.roles && user.roles.length > 1 && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl">
                        <User className="mr-2 h-4 w-4" />
                        Switch Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl p-1">
                          {user.roles.map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleRoleChange(role)}
                              className={`rounded-lg ${role === currentRole ? 'bg-primary/10 text-primary' : ''}`}
                              disabled={isChangingRole}
                            >
                              <span className="capitalize">{role}</span>
                              {role === currentRole && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator className="my-1" />
                  </>
                )}

                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/vectix/profile')} className="rounded-xl">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={handleLogout} className="rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
