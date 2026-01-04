import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    LoadingFallback,
    Popover,
    PopoverContent,
    PopoverTrigger,
    SearchPanel,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    UserAvatar,
    useToast
} from '@/components';
import { useSidebar } from '@/core';
import { useIsMobile } from '@/hooks';
import { getDashboardLink } from '@/lib/redirect';
import { useAuthStore } from '@/store';
import { useTheme } from '@/theme';
import { UserRole, notifications } from '@/types';
import {
    Bell,
    ChevronDown,
    Command,
    HelpCircle,
    LogOut,
    Mail,
    Menu,
    Moon,
    Search,
    Settings,
    Sun,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, setCurrentRole, currentRole } = useAuthStore();
  const { toast } = useToast();
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
        <header className="sticky top-0 z-40 navbar-glass">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={toggleSidebar}
              className="p-2.5 -ml-1 rounded-xl bg-accent hover:bg-border transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-xl bg-accent hover:bg-border transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={toggleMode}
                className="p-2.5 rounded-xl bg-accent hover:bg-border transition-colors"
              >
                {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Drawer direction="bottom">
                <DrawerTrigger asChild>
                  <button className="ml-1 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <UserAvatar
                      name={user?.name || 'User'}
                      role={currentRole || ''}
                      showInfo={false}
                      className="h-9 w-9"
                    />
                  </button>
                </DrawerTrigger>
                <DrawerContent className="rounded-t-3xl">
                  <DrawerHeader className="pb-2">
                    <DrawerTitle className="font-bold">Quick Menu</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-accent rounded-2xl">
                      <UserAvatar
                        name={user?.name || 'User'}
                        role={currentRole || ''}
                        showInfo={false}
                        className="h-12 w-12"
                      />
                      <div>
                        <p className="font-bold">{user?.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{currentRole}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent transition-colors text-left">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent transition-colors text-left">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-accent transition-colors text-left">
                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Help & Support</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Log out</span>
                      </button>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </header>
        <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </>
    );
  }

  return (
    <>
      {showLoader && <LoadingFallback />}

      <header className="sticky top-0 z-40 px-6 py-4 navbar-glass">
        <div className="flex items-center justify-between">
          {/* Left - Greeting */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-foreground">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of your tasks and track progress
            </p>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            {/* Search Bar - Liquid Glass */}
            <div
              className="relative hidden lg:flex items-center cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="flex items-center gap-3 w-56 h-10 px-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">Search task</span>
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded border border-border">
                  <Command className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">F</span>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleMode}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-card hover:bg-accent border border-border transition-colors"
                >
                  {mode === 'dark' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                </button>
              </TooltipTrigger>
              <TooltipContent className="font-medium">{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
            </Tooltip>

            {/* Messages */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-card hover:bg-accent border border-border transition-colors">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="font-medium">Messages</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card hover:bg-accent border border-border transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl glass-card" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-bold">Notifications</h3>
                  <button className="text-xs font-medium text-primary hover:underline">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No notifications</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border last:border-0 hover:bg-accent transition-colors cursor-pointer ${
                          notification.read ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <button className="w-full py-2.5 text-sm font-medium text-center text-primary hover:bg-accent rounded-xl transition-colors">
                    View all notifications
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-card hover:bg-accent border border-border transition-colors">
                  <UserAvatar
                    name={user?.name || 'User'}
                    role={currentRole || ''}
                    showInfo={false}
                    className="h-8 w-8"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-sm font-semibold leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 rounded-2xl p-2 glass-card" align="end">
                <div className="flex items-center gap-3 p-3 mb-2 bg-accent rounded-xl">
                  <UserAvatar
                    name={user?.name || 'User'}
                    role={currentRole || ''}
                    showInfo={false}
                    className="h-10 w-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{currentRole}</p>
                  </div>
                </div>

                {user?.roles && user.roles.length > 1 && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="rounded-xl font-medium">
                        <User className="mr-2 h-4 w-4" />
                        Switch Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="rounded-xl p-1">
                          {user.roles.map(role => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleRoleChange(role)}
                              className={`rounded-lg font-medium ${
                                role === currentRole ? 'bg-primary/10 text-primary' : ''
                              }`}
                              disabled={isChangingRole}
                            >
                              <span className="capitalize">{role}</span>
                              {role === currentRole && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
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
                  <DropdownMenuItem
                    onClick={() => navigate('/vectix/profile')}
                    className="rounded-xl font-medium"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl font-medium">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl font-medium">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Help & Support
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl font-medium text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SearchPanel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
