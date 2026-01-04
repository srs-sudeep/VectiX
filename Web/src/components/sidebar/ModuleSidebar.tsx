import {
    AppLogo,
    ScrollArea,
    Sheet,
    SheetContent,
    SheetTitle,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components';
import { useSidebar } from '@/core';
import { useIsMobile, useSidebarItems } from '@/hooks';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { iconMap, type SidebarModuleItem, type SidebarSubModuleTreeItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    HelpCircle,
    LogOut,
    Settings,
    Smartphone,
} from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const getIconComponent = (iconName: keyof typeof iconMap, size: number) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent size={size} strokeWidth={1.75} /> : null;
};

function findModuleIdByPath(modules: SidebarModuleItem[], pathname: string): string | null {
  for (const module of modules) {
    if (module.subModules && findSubModuleByPath(module.subModules, pathname)) {
      return module.id;
    }
  }
  return modules[0]?.id ?? null;
}

function findSubModuleByPath(subModules: SidebarSubModuleTreeItem[], pathname: string): boolean {
  for (const subModule of subModules) {
    if (subModule.path && pathname.startsWith(subModule.path)) return true;
    if (subModule.children && findSubModuleByPath(subModule.children, pathname)) return true;
  }
  return false;
}

function findActiveSubModule(
  subModules: SidebarSubModuleTreeItem[],
  pathname: string
): SidebarSubModuleTreeItem | null {
  for (const subModule of subModules) {
    if (subModule.path && pathname.startsWith(subModule.path)) {
      return subModule;
    }
    if (subModule.children) {
      const found = findActiveSubModule(subModule.children, pathname);
      if (found) return found;
    }
  }
  return null;
}

function findParentIds(
  items: SidebarSubModuleTreeItem[],
  pathname: string,
  parents: string[] = []
): string[] | null {
  for (const item of items) {
    if (item.path && pathname.startsWith(item.path)) {
      return [...parents];
    }
    if (item.children) {
      const found = findParentIds(item.children, pathname, [...parents, item.id]);
      if (found) return found;
    }
  }
  return null;
}

export const ModuleSidebar = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [lastValidModule, setLastValidModule] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastActiveSubModules, setLastActiveSubModules] = useState<
    Record<string, SidebarSubModuleTreeItem>
  >({});

  const isMobile = useIsMobile();
  const { isOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { sidebarItems: modules = [], isLoading } = useSidebarItems({ is_active: true });

  useEffect(() => {
    if (!isLoading && modules.length > 0) {
      const found = findModuleIdByPath(modules, location.pathname);
      if (found) {
        setActiveModule(found);
        setLastValidModule(found);
      } else if (lastValidModule) {
        setActiveModule(lastValidModule);
      } else {
        setActiveModule(modules[0]?.id ?? null);
      }
    }
  }, [isLoading, modules, location.pathname]);

  useEffect(() => {
    if (!isLoading && modules.length > 0 && activeModule) {
      const module = modules.find(m => m.id === activeModule);
      if (module) {
        const activeSubModule = findActiveSubModule(module.subModules, location.pathname);
        if (activeSubModule) {
          setLastActiveSubModules(prev => ({
            ...prev,
            [activeModule]: activeSubModule,
          }));
        }
      }
    }
  }, [isLoading, modules, activeModule, location.pathname]);

  useEffect(() => {
    if (!isLoading && modules.length > 0 && activeModule) {
      const module = modules.find(m => m.id === activeModule);
      if (module) {
        const parentIds = findParentIds(module.subModules, location.pathname) || [];
        if (parentIds.length === 0 && lastActiveSubModules[activeModule]) {
          const lastActiveParentIds =
            findParentIds(module.subModules, lastActiveSubModules[activeModule].path || '') || [];
          setExpandedItems(prev => Array.from(new Set([...prev, ...lastActiveParentIds])));
        } else {
          setExpandedItems(prev => Array.from(new Set([...prev, ...parentIds])));
        }
      }
    }
  }, [isLoading, modules, activeModule, location.pathname, lastActiveSubModules]);

  const isActivePath = (path?: string) => {
    if (!path) return false;
    const exactMatch = location.pathname === path || location.pathname.startsWith(path);
    if (exactMatch) return true;
    if (
      activeModule &&
      lastActiveSubModules[activeModule] &&
      lastActiveSubModules[activeModule].path === path
    ) {
      const module = modules.find(m => m.id === activeModule);
      if (module && !findActiveSubModule(module.subModules, location.pathname)) {
        return true;
      }
    }
    return false;
  };

  const isActiveOrParent = (path?: string) => path && location.pathname.startsWith(path);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const getFilteredBySearchSubModules = (): SidebarSubModuleTreeItem[] => {
    const module = modules.find(m => m.id === activeModule);
    return module ? module.subModules : [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSubModuleItem = (subModule: SidebarSubModuleTreeItem, level = 0): JSX.Element => {
    const hasChildren = subModule.children && subModule.children.length > 0;
    const isExpanded = expandedItems.includes(subModule.id);
    const isActive = isActivePath(subModule.path);
    const isParentActive = isActiveOrParent(subModule.path);
    // All nested items truncate to prevent overflow
    const shouldTruncate = level >= 1;

    return (
      <div key={subModule.id} className="mb-1">
        <button
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group text-left overflow-hidden',
            isActive
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground',
            isParentActive && !isActive && 'text-foreground'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(subModule.id);
            } else if (subModule.path) {
              navigate(subModule.path);
              closeSidebar();
            }
          }}
        >
          {subModule.icon && (
            <span
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors',
                isActive ? 'bg-white/20' : 'bg-accent group-hover:bg-border'
              )}
            >
              {getIconComponent(subModule.icon as keyof typeof iconMap, 16)}
            </span>
          )}
          <span className={cn('flex-1 min-w-0', shouldTruncate ? 'truncate' : 'leading-tight')}>
            {subModule.label}
          </span>
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200 opacity-60',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </button>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 pl-4 ml-4 border-l-2 border-border">
                {subModule.children?.map(child => renderSubModuleItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderModuleIcon = (module: SidebarModuleItem): JSX.Element => {
    const isActive = activeModule === module.id;

    return (
      <Tooltip key={module.id}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            onClick={() => setActiveModule(module.id)}
          >
            {getIconComponent(module.icon as keyof typeof iconMap, 20)}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="font-medium bg-foreground text-background px-3 py-1.5 rounded-lg"
        >
          {module.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const sidebarContent = (
    <div className="h-full flex" data-component="sidebar">
      {/* Icon Rail - White with subtle glass effect */}
      <div className="w-[72px] h-full flex flex-col items-center py-5 bg-card border-r border-border">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform">
            <AppLogo short className="text-primary-foreground" imgClassname="w-6 h-6" />
          </div>
        </div>

        {/* Menu Label */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Menu
        </span>

        {/* Module Icons */}
        <div className="flex-1 flex flex-col items-center gap-2 w-full px-3">
          {modules.map(renderModuleIcon)}
        </div>

        {/* General Label */}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-4">
          General
        </span>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-1 w-full px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/vectix/settings')}
                className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Settings size={20} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Settings
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <HelpCircle size={20} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Help
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-11 h-11 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut size={20} strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Logout
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Expandable Panel - Liquid Glass Effect */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
            className="h-full flex flex-col overflow-hidden border-r border-border liquid-glass w-[240px]"
          >
            {/* Header - With proper text wrapping */}
            <div className="p-4 pb-3 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground leading-snug">
                {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Manage your workspace</p>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-1 w-full min-w-0 pr-0">
                  {activeModule &&
                    getFilteredBySearchSubModules().map(subModule => renderSubModuleItem(subModule))}
                </div>
              )}
            </ScrollArea>

            {/* App Download Card */}
            <div className="p-3 mt-auto">
              <div className="relative overflow-hidden rounded-2xl gradient-primary p-4 text-primary-foreground">
                {/* Decorative circles */}
                <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full border-4 border-white/20" />
                <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full border-4 border-white/10" />

                <div className="relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                    <Smartphone size={16} />
                  </div>
                  <h4 className="font-bold text-sm leading-tight">Download our Mobile App</h4>
                  <p className="text-[11px] opacity-80 mt-1 mb-3">Get easy in another way</p>
                  <button className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Collapse Toggle */}
            {!isMobile && (
              <div className="p-3 pt-0">
                <button
                  onClick={() => setIsSidebarOpen(v => !v)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Toggle Button - Full Height */}
      {!isSidebarOpen && !isMobile && (
        <div className="w-8 h-full flex items-center justify-center bg-card border-r border-border">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-full h-full flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={closeSidebar}>
          <SheetTitle style={{ display: 'none' }} />
          <SheetContent side="left" className="p-0 w-[320px] border-none">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        sidebarContent
      )}
    </>
  );
};
