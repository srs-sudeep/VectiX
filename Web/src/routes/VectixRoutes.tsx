/**
 * Vectix Routes - Personal Finance & Splitwise
 */

import lazyLoad from '@/lib/lazyLoad';
import { RouteObject } from 'react-router-dom';

// Lazy load Vectix views
const VectixDashboard = lazyLoad(() => import('@/views/vectix/VectixDashboard'));
const AccountsPage = lazyLoad(() => import('@/views/vectix/AccountsPage'));
const TransactionsPage = lazyLoad(() => import('@/views/vectix/TransactionsPage'));
const CategoriesPage = lazyLoad(() => import('@/views/vectix/CategoriesPage'));
const GroupsPage = lazyLoad(() => import('@/views/vectix/GroupsPage'));
const SubscriptionsPage = lazyLoad(() => import('@/views/vectix/SubscriptionsPage'));

/**
 * Vectix Module Routes
 * 
 * Structure:
 * /vectix
 *   /dashboard - Main dashboard
 *   /accounts - Account management
 *   /transactions - Transaction history
 *   /categories - Category management
 *   /subscriptions - Recurring bills
 *   /groups - Splitwise groups
 *   /groups/:id - Group detail
 *   /analytics - Analytics and insights
 */
const VectixRoutes: RouteObject = {
  path: 'vectix',
  children: [
    // Dashboard (Home)
    {
      index: true,
      element: <VectixDashboard />,
    },
    {
      path: 'dashboard',
      element: <VectixDashboard />,
    },
    
    // Personal Finance
    {
      path: 'accounts',
      element: <AccountsPage />,
    },
    {
      path: 'transactions',
      element: <TransactionsPage />,
    },
    {
      path: 'categories',
      element: <CategoriesPage />,
    },
    {
      path: 'subscriptions',
      element: <SubscriptionsPage />,
    },
    
    // Splitwise / Groups
    {
      path: 'groups',
      children: [
        {
          index: true,
          element: <GroupsPage />,
        },
        // Group detail page would go here
        // {
        //   path: ':groupId',
        //   element: <GroupDetailPage />,
        // },
      ],
    },
    
    // Analytics would go here
    // {
    //   path: 'analytics',
    //   element: <AnalyticsPage />,
    // },
  ],
};

export default VectixRoutes;

