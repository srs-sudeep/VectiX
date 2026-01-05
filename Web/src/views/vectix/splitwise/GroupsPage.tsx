/**
 * Groups Management Page (Splitwise)
 */

import { useState } from 'react';
import {
  HelmetWrapper,
  Button,
  DynamicForm,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  toast,
} from '@/components';
import { useGroups, useCreateGroup, useDeleteGroup } from '@/hooks/vectix';
import type { GroupCreate, GroupSummary } from '@/types/vectix';
import type { FieldType } from '@/types';
import { Plus, Users, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const schema: FieldType[] = [
  { name: 'name', label: 'Group Name', type: 'text', required: true, placeholder: 'e.g., Trip to Goa' },
  { name: 'currency', label: 'Currency', type: 'text', required: true, placeholder: 'INR' },
];

const GroupsPage = () => {
  const navigate = useNavigate();
  const { data: groups = [], isLoading } = useGroups();
  const createMutation = useCreateGroup();
  const deleteMutation = useDeleteGroup();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const formatCurrency = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      const newGroup = await createMutation.mutateAsync({
        name: formData.name,
        currency: formData.currency || 'INR',
      } as GroupCreate);
      toast({ title: 'Group created successfully' });
      setCreateDialogOpen(false);
      navigate(`/vectix/splitwise/groups/${newGroup.id}`);
    } catch (error) {
      toast({ title: 'Failed to create group', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Group deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete group', variant: 'destructive' });
    }
  };

  return (
    <HelmetWrapper
      title="Groups | VectiX"
      heading="Groups"
      subHeading="Split expenses with friends and family"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'}
          </p>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
              </DialogHeader>
              <DynamicForm
                schema={schema}
                onSubmit={handleCreate}
                defaultValues={{ currency: 'INR' }}
                onCancel={() => setCreateDialogOpen(false)}
                submitButtonText="Create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">Create your first group to start splitting expenses</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group: GroupSummary) => (
              <div
                key={group.id}
                className="glass-card rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => navigate(`/vectix/splitwise/groups/${group.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(group.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Your Balance</p>
                    <p className={`font-semibold ${
                      group.your_balance > 0
                        ? 'text-success'
                        : group.your_balance < 0
                        ? 'text-destructive'
                        : 'text-foreground'
                    }`}>
                      {group.your_balance > 0 && '+'}
                      {group.your_balance === 0 ? 'Settled' : formatCurrency(group.your_balance, group.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold">{formatCurrency(group.total_expenses, group.currency)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-4 text-primary group-hover:gap-2 transition-all">
                  <span className="text-sm font-medium">View Details</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HelmetWrapper>
  );
};

export default GroupsPage;

