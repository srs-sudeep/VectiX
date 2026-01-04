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
import { iconMap, type SidebarModuleItem, type SidebarSubModuleTreeItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, HelpCircle, LogOut, Settings } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const getIconComponent = (iconName: keyof typeof iconMap, size: number) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent size={size} strokeWidth={1.5} /> : null;
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

  const renderSubModuleItem = (subModule: SidebarSubModuleTreeItem, level = 0): JSX.Element => {
    const hasChildren = subModule.children && subModule.children.length > 0;
    const isExpanded = expandedItems.includes(subModule.id);
    const isActive = isActivePath(subModule.path);
    const isParentActive = isActiveOrParent(subModule.path);

    return (
      <div key={subModule.id} className="mb-0.5">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
            isParentActive && !isActive && 'text-foreground',
            level > 0 && 'ml-4'
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
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              isActive ? 'bg-primary-foreground/20' : 'bg-accent'
            )}>
              {getIconComponent(subModule.icon as keyof typeof iconMap, 16)}
            </div>
          )}
          <span className="flex-1">{subModule.label}</span>
          {hasChildren && (
            <ChevronRight
              className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-90')}
            />
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 ml-4 pl-4 border-l-2 border-border/50">
            {subModule.children?.map(child => renderSubModuleItem(child, level + 1))}
          </div>
        )}
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
              'flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/60 hover:bg-accent hover:text-foreground'
            )}
            onClick={() => setActiveModule(module.id)}
          >
            {getIconComponent(module.icon as keyof typeof iconMap, 20)}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {module.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const sidebarContent = (
    <div className="h-full flex bg-card" data-component="sidebar">
      {/* Icon Rail */}
      <div className="w-[72px] h-full flex flex-col items-center py-4 bg-card border-r border-border/50">
        {/* Logo */}
        <div className="mb-6 p-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <AppLogo short className="text-primary-foreground" imgClassname="w-6 h-6" />
          </div>
        </div>

        {/* Module Icons */}
        <div className="flex-1 flex flex-col items-center gap-2 w-full px-3">
          {modules.map(renderModuleIcon)}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border/50 w-full px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground/60 hover:bg-accent hover:text-foreground transition-all">
                <Settings size={20} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-foreground/60 hover:bg-accent hover:text-foreground transition-all">
                <HelpCircle size={20} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Help</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-11 h-11 rounded-xl text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all">
                <LogOut size={20} strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Expandable Panel */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="h-full flex flex-col bg-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">
                {modules.find(m => m.id === activeModule)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your workspace
              </p>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-0.5">
                  {activeModule && getFilteredBySearchSubModules().map(subModule => renderSubModuleItem(subModule))}
                </div>
              )}
            </ScrollArea>

            {/* Toggle Button */}
            {!isMobile && (
              <div className="p-3 border-t border-border/50">
                <button
                  onClick={() => setIsSidebarOpen(v => !v)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ChevronRight className={cn('h-4 w-4 transition-transform', !isSidebarOpen && 'rotate-180')} />
                  <span>Collapse</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Toggle */}
      {!isSidebarOpen && !isMobile && (
        <div className="flex items-center justify-center w-8 bg-card border-r border-border/50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
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
