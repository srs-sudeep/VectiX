import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { RouteObject } from 'react-router-dom';

// Dashboard Pages
const AdminDashboard = lazyLoad(() => import('@/views/dashboard/AdminDashboard'));
const Profile = lazyLoad(() => import('@/views/dashboard/Profile'));



const DashboardRoutes: RouteObject = {
  path: 'vectix/dashboard',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: 'profile',
      element: <Profile />,
    },
    {
      path: 'admin',
      element: <AdminDashboard />,
    },
    {
      path: 'user',
      element: <AdminDashboard />,
    },
  ],
};

export default DashboardRoutes;
