/**
 * Vectix Routes - Personal Finance & Splitwise
 * 
 * Modular Structure:
 * /vectix
 *   /dashboard - Main dashboard (overview of both modules)
 *   /finance - Personal Finance Module
 *     /accounts - Banks/Wallets/Buckets management
 *     /transactions - Transaction history
 *     /categories - Category management
 *     /subscriptions - Recurring bills
 *   /splitwise - Splitwise Module
 *     /groups - Groups management
 *     /groups/:id - Group detail
 *     /teams - Teams (future)
 *     /analytics - Splitwise analytics
 *     /logs - Activity logs
 */

import MainLayout from '@/layouts/MainLayout';
import lazyLoad from '@/lib/lazyLoad';
import { RouteObject } from 'react-router-dom';

// Main Dashboard
const VectixDashboard = lazyLoad(() => import('@/views/vectix/VectixDashboard'));

// Personal Finance Module
const AccountsPage = lazyLoad(() => import('@/views/vectix/finance/AccountsPage'));
const TransactionsPage = lazyLoad(() => import('@/views/vectix/finance/TransactionsPage'));
const CategoriesPage = lazyLoad(() => import('@/views/vectix/finance/CategoriesPage'));
const SubscriptionsPage = lazyLoad(() => import('@/views/vectix/finance/SubscriptionsPage'));

// Splitwise Module
const GroupsPage = lazyLoad(() => import('@/views/vectix/splitwise/GroupsPage'));
// Placeholder for future Splitwise views
// const GroupDetailPage = lazyLoad(() => import('@/views/vectix/splitwise/GroupDetailPage'));
// const TeamsPage = lazyLoad(() => import('@/views/vectix/splitwise/TeamsPage'));
// const SplitwiseAnalyticsPage = lazyLoad(() => import('@/views/vectix/splitwise/SplitwiseAnalyticsPage'));
// const SplitwiseLogsPage = lazyLoad(() => import('@/views/vectix/splitwise/SplitwiseLogsPage'));

const VectixRoutes: RouteObject = {
  path: 'vectix',
  element: <MainLayout />,
  children: [
    // Main Dashboard (Overview)
    {
      index: true,
      element: <VectixDashboard />,
    },
    {
      path: 'dashboard',
      element: <VectixDashboard />,
    },
    
    // ==================== Personal Finance Module ====================
    {
      path: 'finance',
      children: [
        // Accounts (Banks/Wallets/Buckets)
        {
          path: 'accounts',
          element: <AccountsPage />,
        },
        
        // Transactions
        {
          path: 'transactions',
          element: <TransactionsPage />,
        },
        
        // Categories
        {
          path: 'categories',
          element: <CategoriesPage />,
        },
        
        // Subscriptions
        {
          path: 'subscriptions',
          element: <SubscriptionsPage />,
        },
      ],
    },
    
    // ==================== Splitwise Module ====================
    {
      path: 'splitwise',
      children: [
        // Groups
        {
          path: 'groups',
          children: [
            {
              index: true,
              element: <GroupsPage />,
            },
            // Group detail page
            // {
            //   path: ':groupId',
            //   element: <GroupDetailPage />,
            // },
          ],
        },
        
        // Teams (Future)
        // {
        //   path: 'teams',
        //   element: <TeamsPage />,
        // },
        
        // Analytics (Future)
        // {
        //   path: 'analytics',
        //   element: <SplitwiseAnalyticsPage />,
        // },
        
        // Logs (Future)
        // {
        //   path: 'logs',
        //   element: <SplitwiseLogsPage />,
        // },
      ],
    },
  ],
};

export default VectixRoutes;
