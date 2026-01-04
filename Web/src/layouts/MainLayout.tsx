import { MainFooter, ModuleSidebar, Navbar } from '@/components';
import { SidebarProvider } from '@/core';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <ModuleSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Navbar */}
          <Navbar />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 min-h-full">
              <Outlet />
            </div>
          </main>

          {/* Footer */}
          <MainFooter />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
