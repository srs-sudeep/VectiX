import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { type RouteObject } from 'react-router-dom';

// Lazy load admin views
const PermissionManagement = lazyLoad(() => import('@/views/admin/PermissionManagement'));
const ModuleManagement = lazyLoad(() => import('@/views/admin/ModuleManagement'));
const RouteManagement = lazyLoad(() => import('@/views/admin/RouteManagement'));
const RolesManagement = lazyLoad(() => import('@/views/admin/RolesManagement'));
const UserManagement = lazyLoad(() => import('@/views/admin/UserManagement'));
const AdminRoutes: RouteObject = {
  path: 'vectix/admin',
  element: <MainLayout />,
  children: [
    {
      path: 'role',
      element: <RolesManagement />,
    },
    {
      path: 'permission',
      element: <PermissionManagement />,
    },
    {
      path: 'module',
      element: <ModuleManagement />,
    },
    {
      path: 'user',
      element: <UserManagement />,
    },
    {
      path: 'route',
      element: <RouteManagement />,
    }
  ],
};

export default AdminRoutes;
