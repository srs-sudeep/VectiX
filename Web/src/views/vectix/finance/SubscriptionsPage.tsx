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
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useMarkSubscriptionPaid,
  useAccounts,
} from '@/hooks/vectix';
import type { Subscription, SubscriptionCreate, SubscriptionUpdate } from '@/types/vectix';
import type { FieldType } from '@/types';
import { Plus, Pencil, Trash2, Check, Calendar } from 'lucide-react';

const SubscriptionsPage = () => {
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const { data: accounts = [] } = useAccounts();
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const deleteMutation = useDeleteSubscription();
  const markPaidMutation = useMarkSubscriptionPaid();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dateStr: string) => {
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSchema = (): FieldType[] => [
    { name: 'name', label: 'Subscription Name', type: 'text', required: true, placeholder: 'e.g., Netflix' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    { name: 'currency', label: 'Currency', type: 'text', placeholder: 'INR' },
    {
      name: 'interval',
      label: 'Billing Interval',
      type: 'chip',
      required: true,
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Yearly', value: 'yearly' },
      ],
    },
    {
      name: 'account_id',
      label: 'Payment Account',
      type: 'select',
      required: true,
      options: accounts.map((a) => ({ label: a.name, value: a.id })),
    },
    { name: 'next_due_date', label: 'Next Due Date', type: 'date', required: true },
    { name: 'is_active', label: 'Active', type: 'toggle' },
  ];

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency || 'INR',
        interval: formData.interval,
        account_id: formData.account_id,
        next_due_date: formData.next_due_date,
        is_active: formData.is_active ?? true,
      } as SubscriptionCreate);
      toast({ title: 'Subscription created successfully' });
      setCreateDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to create subscription', variant: 'destructive' });
    }
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editSubscription) return;
    try {
      await updateMutation.mutateAsync({
        id: editSubscription.id,
        payload: formData as SubscriptionUpdate,
      });
      toast({ title: 'Subscription updated successfully' });
      setEditSubscription(null);
    } catch (error) {
      toast({ title: 'Failed to update subscription', variant: 'destructive' });
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaidMutation.mutateAsync(id);
      toast({ title: 'Subscription marked as paid' });
    } catch (error) {
      toast({ title: 'Failed to mark as paid', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Subscription deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete subscription', variant: 'destructive' });
    }
  };

  const customRender = {
    Amount: (value: number, row: any) => (
      <span className="font-semibold">{formatCurrency(value, row.Currency)}</span>
    ),
    Interval: (value: string) => (
      <span className="capitalize">{value}</span>
    ),
    'Next Due': (value: string) => {
      const days = getDaysUntilDue(value);
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          {days <= 7 && days >= 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              days === 0 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
            }`}>
              {days === 0 ? 'Today' : `${days}d`}
            </span>
          )}
        </div>
      );
    },
    Status: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
      }`}>
        {value ? 'Active' : 'Paused'}
      </span>
    ),
    'Mark Paid': (_: any, row: any) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => handleMarkPaid(row._raw.id)}
        disabled={markPaidMutation.isPending}
        title="Mark as paid and advance due date"
      >
        <Check className="h-4 w-4 text-success" />
      </Button>
    ),
    Edit: (_: any, row: any) => (
      <Dialog
        open={editSubscription?.id === row._raw.id}
        onOpenChange={(open) => !open && setEditSubscription(null)}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => setEditSubscription(row._raw)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={getSchema()}
            onSubmit={handleUpdate}
            defaultValues={editSubscription || undefined}
            onCancel={() => setEditSubscription(null)}
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

  const tableData = subscriptions.map((sub) => {
    const account = accounts.find((a) => a.id === sub.account_id);
    return {
      Name: sub.name,
      Amount: sub.amount,
      Currency: sub.currency,
      Interval: sub.interval,
      Account: account?.name || '-',
      'Next Due': sub.next_due_date,
      Status: sub.is_active,
      'Mark Paid': '',
      Edit: '',
      Delete: '',
      _raw: sub,
    };
  });

  return (
    <HelmetWrapper
      title="Subscriptions | VectiX"
      heading="Subscriptions"
      subHeading="Track your recurring bills and subscriptions"
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
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subscription</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={getSchema()}
                onSubmit={handleCreate}
                defaultValues={{
                  currency: 'INR',
                  interval: 'monthly',
                  is_active: true,
                  next_due_date: new Date().toISOString().split('T')[0],
                }}
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

export default SubscriptionsPage;

