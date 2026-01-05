import { useState } from 'react';
import {
  HelmetWrapper,
  Button,
  DynamicTable,
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from '@/components';
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useAccounts,
  useCategories,
} from '@/hooks/vectix';
import type { Transaction, TransactionCreate } from '@/types/vectix';
import type { FieldType } from '@/types';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight } from 'lucide-react';

const transactionTypeIcons: Record<string, React.ReactNode> = {
  income: <ArrowUpRight className="h-4 w-4 text-success" />,
  expense: <ArrowDownRight className="h-4 w-4 text-destructive" />,
  transfer: <ArrowLeftRight className="h-4 w-4 text-info" />,
};

const TransactionsPage = () => {
  const [filters, setFilters] = useState<{ type?: string; limit: number; offset: number }>({
    limit: 50,
    offset: 0,
  });
  const { data: transactionsData, isLoading } = useTransactions(filters);
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>('expense');

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getSchema = (): FieldType[] => [
    {
      name: 'type',
      label: 'Type',
      type: 'chip',
      required: true,
      options: [
        { label: 'Expense', value: 'expense' },
        { label: 'Income', value: 'income' },
        { label: 'Transfer', value: 'transfer' },
      ],
    },
    {
      name: 'account_id',
      label: transactionType === 'transfer' ? 'From Account' : 'Account',
      type: 'select',
      required: true,
      options: accounts.map((a) => ({ label: `${a.name} (${formatCurrency(a.current_balance)})`, value: a.id })),
    },
    ...(transactionType === 'transfer'
      ? [
          {
            name: 'related_account_id',
            label: 'To Account',
            type: 'select' as const,
            required: true,
            options: accounts.map((a) => ({ label: `${a.name} (${formatCurrency(a.current_balance)})`, value: a.id })),
          },
        ]
      : []),
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    {
      name: 'category_id',
      label: 'Category',
      type: 'select',
      options: categories
        .filter((c) => c.type === transactionType || transactionType === 'transfer')
        .map((c) => ({ label: c.name, value: c.id })),
    },
    { name: 'description', label: 'Description', type: 'text', placeholder: 'What was this for?' },
    { name: 'transaction_date', label: 'Date', type: 'date', required: true },
  ];

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      await createMutation.mutateAsync({
        type: formData.type,
        account_id: formData.account_id,
        amount: parseFloat(formData.amount),
        description: formData.description,
        transaction_date: formData.transaction_date,
        category_id: formData.category_id || undefined,
        related_account_id: formData.related_account_id || undefined,
      } as TransactionCreate);
      toast({ title: 'Transaction added successfully' });
      setCreateDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to add transaction', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Transaction deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete transaction', variant: 'destructive' });
    }
  };

  const customRender = {
    Type: (value: string) => (
      <div className="flex items-center gap-2">
        {transactionTypeIcons[value]}
        <span className="capitalize">{value}</span>
      </div>
    ),
    Amount: (value: number, row: any) => (
      <span className={`font-semibold ${
        row.Type === 'income' ? 'text-success' : row.Type === 'expense' ? 'text-destructive' : 'text-info'
      }`}>
        {row.Type === 'income' ? '+' : row.Type === 'expense' ? '-' : ''}
        {formatCurrency(value)}
      </span>
    ),
    Date: (value: string) => new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    Delete: (_: any, row: any) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleDelete(row._raw.id)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    ),
  };

  const tableData = (transactionsData?.transactions || []).map((tx: Transaction) => {
    const account = accounts.find((a) => a.id === tx.account_id);
    const category = categories.find((c) => c.id === tx.category_id);
    return {
      Date: tx.transaction_date,
      Type: tx.type,
      Description: tx.description || '-',
      Category: category?.name || '-',
      Account: account?.name || '-',
      Amount: tx.amount,
      Delete: '',
      _raw: tx,
    };
  });

  return (
    <HelmetWrapper
      title="Transactions | VectiX"
      heading="Transactions"
      subHeading="Track all your income and expenses"
    >
      {/* Filter Chips */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={!filters.type ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, type: undefined })}
        >
          All
        </Button>
        <Button
          variant={filters.type === 'income' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, type: 'income' })}
        >
          <ArrowUpRight className="h-4 w-4 mr-1" /> Income
        </Button>
        <Button
          variant={filters.type === 'expense' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, type: 'expense' })}
        >
          <ArrowDownRight className="h-4 w-4 mr-1" /> Expense
        </Button>
        <Button
          variant={filters.type === 'transfer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilters({ ...filters, type: 'transfer' })}
        >
          <ArrowLeftRight className="h-4 w-4 mr-1" /> Transfer
        </Button>
      </div>

      <DynamicTable
        data={tableData}
        isLoading={isLoading}
        customRender={customRender}
        headerActions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={getSchema()}
                onSubmit={handleCreate}
                defaultValues={{
                  type: transactionType,
                  transaction_date: new Date().toISOString().split('T')[0],
                }}
                onChange={(data) => {
                  if (data.type && data.type !== transactionType) {
                    setTransactionType(data.type as any);
                  }
                }}
                onCancel={() => setCreateDialogOpen(false)}
                submitButtonText="Add"
              />
            </DialogContent>
          </Dialog>
        }
      />
    </HelmetWrapper>
  );
};

export default TransactionsPage;

