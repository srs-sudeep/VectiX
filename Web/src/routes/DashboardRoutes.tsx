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
      path: 'admin',
      element: <AdminDashboard />,
    },
  ],
};

// Profile route (separate from dashboard)
const ProfileRoute: RouteObject = {
  path: 'vectix/profile',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <Profile />,
    },
  ],
};

export { ProfileRoute };
export default DashboardRoutes;
