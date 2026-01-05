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
  useCategoriesWithStats,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateDefaultCategories,
} from '@/hooks/vectix';
import type { CategoryWithStats, CategoryCreate, CategoryUpdate } from '@/types/vectix';
import type { FieldType } from '@/types';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';

const schema: FieldType[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g., Food & Dining' },
  {
    name: 'type',
    label: 'Type',
    type: 'chip',
    required: true,
    options: [
      { label: 'Expense', value: 'expense' },
      { label: 'Income', value: 'income' },
    ],
  },
  { name: 'icon', label: 'Icon', type: 'text', placeholder: 'e.g., Utensils' },
  { name: 'color', label: 'Color', type: 'text', placeholder: '#FF6B6B' },
];

const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useCategoriesWithStats();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const createDefaultsMutation = useCreateDefaultCategories();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryWithStats | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreate = async (formData: Record<string, any>) => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        type: formData.type,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
      } as CategoryCreate);
      toast({ title: 'Category created successfully' });
      setCreateDialogOpen(false);
    } catch (error) {
      toast({ title: 'Failed to create category', variant: 'destructive' });
    }
  };

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!editCategory) return;
    try {
      await updateMutation.mutateAsync({
        id: editCategory.id,
        payload: {
          name: formData.name,
          type: formData.type,
          icon: formData.icon,
          color: formData.color,
        } as CategoryUpdate,
      });
      toast({ title: 'Category updated successfully' });
      setEditCategory(null);
    } catch (error) {
      toast({ title: 'Failed to update category', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Category deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete category', variant: 'destructive' });
    }
  };

  const handleCreateDefaults = async () => {
    try {
      await createDefaultsMutation.mutateAsync();
      toast({ title: 'Default categories created successfully' });
    } catch (error) {
      toast({ title: 'Failed to create default categories', variant: 'destructive' });
    }
  };

  const customRender = {
    Color: (value: string) => (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full border"
          style={{ backgroundColor: value || '#ccc' }}
        />
        <span className="text-xs text-muted-foreground">{value || 'None'}</span>
      </div>
    ),
    Type: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
      }`}>
        {value}
      </span>
    ),
    Transactions: (value: number) => (
      <span className="text-muted-foreground">{value}</span>
    ),
    'Total Amount': (value: number) => (
      <span className="font-medium">{formatCurrency(value)}</span>
    ),
    Edit: (_: any, row: any) => (
      <Dialog
        open={editCategory?.id === row._raw.id}
        onOpenChange={(open) => !open && setEditCategory(null)}
      >
        <DialogTrigger asChild>
          <Button size="icon" variant="ghost" onClick={() => setEditCategory(row._raw)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            onSubmit={handleUpdate}
            defaultValues={editCategory || undefined}
            onCancel={() => setEditCategory(null)}
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

  const tableData = categories.map((category) => ({
    Name: category.name,
    Type: category.type,
    Icon: category.icon || '-',
    Color: category.color,
    Transactions: category.transaction_count,
    'Total Amount': category.total_amount,
    Edit: '',
    Delete: '',
    _raw: category,
  }));

  return (
    <HelmetWrapper
      title="Categories | VectiX"
      heading="Categories"
      subHeading="Organize your transactions with categories"
    >
      <DynamicTable
        data={tableData}
        isLoading={isLoading}
        customRender={customRender}
        headerActions={
          <div className="flex gap-2">
            {categories.length === 0 && (
              <Button
                variant="outline"
                onClick={handleCreateDefaults}
                disabled={createDefaultsMutation.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Create Defaults
              </Button>
            )}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Category</DialogTitle>
                </DialogHeader>
                <DynamicForm
                  schema={schema}
                  onSubmit={handleCreate}
                  defaultValues={{ type: 'expense' }}
                  onCancel={() => setCreateDialogOpen(false)}
                  submitButtonText="Create"
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />
    </HelmetWrapper>
  );
};

export default CategoriesPage;

