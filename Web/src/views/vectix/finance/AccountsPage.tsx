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
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/vectix';
import type { Account, AccountCreate, AccountUpdate } from '@/types/vectix';
import type { FieldType } from '@/types';
import { Plus, Pencil, Trash2, Wallet, CreditCard, Banknote, PiggyBank } from 'lucide-react';

const accountTypeIcons: Record<string, React.ReactNode> = {
  bank: <Banknote className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  wallet: <PiggyBank className="h-4 w-4" />,
  credit: <CreditCard className="h-4 w-4" />,
};

const schema: FieldType[] = [
  { name: 'name', label: 'Account Name', type: 'text', required: true, placeholder: 'e.g., SBI Savings' },
  {
    name: 'type',
    label: 'Account Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Bank Account', value: 'bank' },
      { label: 'Cash', value: 'cash' },
      { label: 'Digital Wallet', value: 'wallet' },
      { label: 'Credit Card', value: 'credit' },
    ],
  },
  { name: 'currency', label: 'Currency', type: 'text', required: true, placeholder: 'INR' },
  { name: 'opening_balance', label: 'Opening Balance', type: 'number', required: true, placeholder: '0' },
  { name: 'is_active', label: 'Active', type: 'toggle' },
];

const AccountsPage = () => {
  const { data: accounts = [], isLoading } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        currency: formData.currency || 'INR',
        opening_balance: parseFloat(formData.opening_balance) || 0,
        is_active: formData.is_active ?? true,
      } as AccountCreate);
      toast({ title: 'Account created successfully' });
      setCreateDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to create account', variant: 'destructive' });
    }
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editAccount) return;
    try {
      await updateMutation.mutateAsync({
        id: editAccount.id,
        payload: {
          name: formData.name,
          type: formData.type,
          currency: formData.currency,
          is_active: formData.is_active,
        } as AccountUpdate,
      });
      toast({ title: 'Account updated successfully' });
      setEditAccount(null);
    } catch (error) {
      toast({ title: 'Failed to update account', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Account archived successfully' });
    } catch (error) {
      toast({ title: 'Failed to archive account', variant: 'destructive' });
    }
  };

  const customRender = {
    Type: (value: string) => (
      <div className="flex items-center gap-2">
        {accountTypeIcons[value] || <Wallet className="h-4 w-4" />}
        <span className="capitalize">{value}</span>
      </div>
    ),
    Balance: (value: number, row: any) => (
      <span className={value >= 0 ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
        {formatCurrency(value, row.Currency)}
      </span>
    ),
    Status: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
      }`}>
        {value ? 'Active' : 'Archived'}
      </span>
    ),
    Edit: (_: any, row: any) => (
      <Dialog
        open={editAccount?.id === row._raw.id}
        onOpenChange={(open) => !open && setEditAccount(null)}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => setEditAccount(row._raw)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleUpdate}
            defaultValues={editAccount || undefined}
            onCancel={() => setEditAccount(null)}
            submitButtonText="Save"
          />
        </DialogContent>
      </Dialog>
    ),
    Delete: (_: any, row: any) => (
      <Button
        size="icon"
        variant="destructive"
        onClick={() => handleDelete(row._raw.id)}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    ),
  };

  const tableData = accounts.map((account) => ({
    Name: account.name,
    Type: account.type,
    Currency: account.currency,
    Balance: account.current_balance,
    Status: account.is_active,
    Edit: '',
    Delete: '',
    _raw: account,
  }));

  return (
    <HelmetWrapper
      title="Accounts | VectiX"
      heading="Accounts"
      subHeading="Manage your wallets, bank accounts, and credit cards"
    >
      <DynamicTable
        data={tableData}
        isLoading={isLoading}
        customRender={customRender}
        headerActions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Account</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={schema}
                onSubmit={handleCreate}
                defaultValues={{ currency: 'INR', is_active: true, opening_balance: 0 }}
                onCancel={() => setCreateDialogOpen(false)}
                submitButtonText="Create"
              />
            </DialogContent>
          </Dialog>
        }
      />
    </HelmetWrapper>
  );
};

export default AccountsPage;

