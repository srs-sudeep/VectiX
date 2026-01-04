/**
 * Vectix Dashboard - Main Home/Dashboard
 */

import { HelmetWrapper, Button } from '@/components';
import { useDashboardSummary, useMonthlyBreakdown, useQuickStats } from '@/hooks/vectix';
import { 
  Wallet, TrendingUp, TrendingDown, Users, Plus, 
  ArrowUpRight, ArrowDownRight, CreditCard, PiggyBank 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VectixDashboard = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyBreakdown(6);
  const { data: quickStats, isLoading: statsLoading } = useQuickStats();

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = summaryLoading || monthlyLoading || statsLoading;

  return (
    <HelmetWrapper
      title="Dashboard | VectiX"
      heading="Dashboard"
      subHeading="Track your finances and manage expenses"
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/vectix/transactions/add?type=expense')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
          <Button variant="outline" onClick={() => navigate('/vectix/transactions/add?type=income')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
          <Button variant="outline" onClick={() => navigate('/vectix/groups/expense/add')} className="gap-2">
            <Users className="h-4 w-4" />
            Add Group Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Balance */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Total Balance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? '...' : formatCurrency(summary?.net_balance || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Across {summary?.account_count || 0} accounts
            </p>
          </div>

          {/* This Month Income */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">This Month Income</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {isLoading ? '...' : formatCurrency(summary?.total_income || 0)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <span className="text-sm text-success">Income</span>
            </div>
          </div>

          {/* This Month Expense */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">This Month Expense</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {isLoading ? '...' : formatCurrency(summary?.total_expense || 0)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">Expense</span>
            </div>
          </div>

          {/* Pending Group Dues */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Group Dues</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {isLoading ? '...' : formatCurrency(summary?.pending_group_dues || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary?.group_count || 0} active groups
            </p>
          </div>
        </div>

        {/* Monthly Breakdown Chart Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
            <div className="space-y-4">
              {monthlyData?.slice(-3).map((month, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-accent/50 rounded-xl">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex gap-4">
                    <span className="text-success">+{formatCurrency(month.income)}</span>
                    <span className="text-destructive">-{formatCurrency(month.expense)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Subscriptions */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming Payments</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/vectix/subscriptions')}>
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {quickStats?.upcoming_subscriptions?.length ? (
                quickStats.upcoming_subscriptions.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-accent/50 rounded-xl">
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.days_until_due === 0 ? 'Due Today' : `In ${sub.days_until_due} days`}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(sub.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No upcoming payments</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/vectix/accounts')}
            className="glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <CreditCard className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-semibold">Accounts</h4>
            <p className="text-sm text-muted-foreground">Manage wallets & banks</p>
          </button>
          <button
            onClick={() => navigate('/vectix/transactions')}
            className="glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <TrendingUp className="h-8 w-8 text-success mb-3" />
            <h4 className="font-semibold">Transactions</h4>
            <p className="text-sm text-muted-foreground">View all transactions</p>
          </button>
          <button
            onClick={() => navigate('/vectix/groups')}
            className="glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <Users className="h-8 w-8 text-info mb-3" />
            <h4 className="font-semibold">Groups</h4>
            <p className="text-sm text-muted-foreground">Split expenses</p>
          </button>
          <button
            onClick={() => navigate('/vectix/analytics')}
            className="glass-card rounded-2xl p-6 text-left hover:shadow-lg transition-shadow"
          >
            <PiggyBank className="h-8 w-8 text-warning mb-3" />
            <h4 className="font-semibold">Analytics</h4>
            <p className="text-sm text-muted-foreground">Track spending</p>
          </button>
        </div>
      </div>
    </HelmetWrapper>
  );
};

export default VectixDashboard;

