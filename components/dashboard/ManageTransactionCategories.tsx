"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  ShoppingCart,
  Car,
  Home,
  Heart,
  Utensils,
  Gamepad2,
  Briefcase,
  DollarSign,
  Gift,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isIncome: boolean;
}

interface ManageTransactionCategoriesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CategoryIcons = {
  ShoppingCart,
  Car,
  Home,
  Heart,
  Utensils,
  Gamepad2,
  Briefcase,
  DollarSign,
  Gift,
  TrendingUp,
};

const iconOptions = Object.keys(CategoryIcons);

const colorOptions = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Pink", value: "pink" },
  { name: "Indigo", value: "indigo" },
  { name: "Teal", value: "teal" },
];

export function ManageTransactionCategories({
  open,
  onOpenChange,
}: ManageTransactionCategoriesProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">(
    "all"
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "ShoppingCart",
    color: "blue",
    isIncome: false,
  });

  useEffect(() => {
    if (open && user) {
      fetchCategories();
    }
  }, [open, user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions/categories", {
        headers: {
          Authorization: `Bearer ${user?.id}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const url = "/api/transactions/categories";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      // Reset form and refresh data
      setFormData({
        name: "",
        description: "",
        icon: "ShoppingCart",
        color: "blue",
        isIncome: false,
      });
      setEditingId(null);
      setShowAddForm(false);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isIncome: category.isIncome,
    });
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      setLoading(true);
      const response = await fetch("/api/transactions/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      await fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      icon: "ShoppingCart",
      color: "blue",
      isIncome: false,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = CategoryIcons[iconName as keyof typeof CategoryIcons];
    return IconComponent ? (
      <IconComponent className='w-5 h-5' />
    ) : (
      <ShoppingCart className='w-5 h-5' />
    );
  };

  const getCategoryColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      green:
        "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
      red: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      purple:
        "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      orange:
        "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      pink: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
      indigo:
        "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      teal: "bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    };
    return colorMap[color] || colorMap.blue;
  };

  const filteredCategories = categories.filter((category) => {
    if (activeTab === "income") return category.isIncome;
    if (activeTab === "expense") return !category.isIncome;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ShoppingCart className='w-5 h-5' />
            Manage Transaction Categories
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove categories for your income and expense
            transactions.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
            <p className='text-red-600 dark:text-red-400 text-sm'>{error}</p>
          </div>
        )}

        <div className='space-y-6'>
          {/* Add New Button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className='w-full bg-blue-600 hover:bg-blue-700'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add New Category
            </Button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className='border-2 border-blue-200 dark:border-blue-800'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  {editingId ? "Edit Category" : "Add New Category"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='name' className='flex items-center gap-1'>
                        Name
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder='e.g., Groceries'
                        required
                        className={`transition-all duration-200 ${
                          !formData.name
                            ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                            : formData.name.length > 0
                            ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                            : ""
                        }`}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label>Type</Label>
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          variant={!formData.isIncome ? "default" : "outline"}
                          onClick={() =>
                            setFormData({ ...formData, isIncome: false })
                          }
                          className='flex-1'
                        >
                          <ArrowDownCircle className='w-4 h-4 mr-2' />
                          Expense
                        </Button>
                        <Button
                          type='button'
                          variant={formData.isIncome ? "default" : "outline"}
                          onClick={() =>
                            setFormData({ ...formData, isIncome: true })
                          }
                          className='flex-1'
                        >
                          <ArrowUpCircle className='w-4 h-4 mr-2' />
                          Income
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='icon'>Icon</Label>
                      <select
                        id='icon'
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        className='w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='color'>Color</Label>
                      <select
                        id='color'
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className='w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {colorOptions.map((color) => (
                          <option key={color.value} value={color.value}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='description'
                      className='flex items-center gap-1'
                    >
                      Description
                      <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='description'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder='e.g., Food and grocery shopping'
                      required
                      className={`transition-all duration-200 ${
                        !formData.description
                          ? "border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/50 dark:bg-red-950/20"
                          : formData.description.length > 0
                          ? "border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/50 dark:bg-green-950/20"
                          : ""
                      }`}
                    />
                  </div>

                  {/* Preview */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getCategoryColor(
                      formData.color
                    )}`}
                  >
                    <span className='text-sm font-medium'>Preview:</span>
                    <div className='p-2 rounded-lg border'>
                      {getIcon(formData.icon)}
                    </div>
                    <div>
                      <span className='font-medium'>
                        {formData.name || "Category Name"}
                      </span>
                      <Badge variant='outline' className='ml-2'>
                        {formData.isIncome ? "Income" : "Expense"}
                      </Badge>
                      <p className='text-xs text-muted-foreground'>
                        {formData.description || "Description"}
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className='w-4 h-4 mr-2' />
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={
                        loading || !formData.name || !formData.description
                      }
                      className='bg-green-600 hover:bg-green-700'
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size='sm' className='mr-2' />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className='w-4 h-4 mr-2' />
                          {editingId ? "Update" : "Create"} Category
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <div className='flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg'>
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className='flex-1'
            >
              All Categories ({categories.length})
            </Button>
            <Button
              variant={activeTab === "income" ? "default" : "ghost"}
              onClick={() => setActiveTab("income")}
              className='flex-1'
            >
              <ArrowUpCircle className='w-4 h-4 mr-2' />
              Income ({categories.filter((c) => c.isIncome).length})
            </Button>
            <Button
              variant={activeTab === "expense" ? "default" : "ghost"}
              onClick={() => setActiveTab("expense")}
              className='flex-1'
            >
              <ArrowDownCircle className='w-4 h-4 mr-2' />
              Expense ({categories.filter((c) => !c.isIncome).length})
            </Button>
          </div>

          {/* Categories List */}
          <div className='space-y-4'>
            {loading && categories.length === 0 ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner size='lg' />
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card>
                <CardContent className='text-center py-8'>
                  <ShoppingCart className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No {activeTab === "all" ? "" : activeTab} categories found
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Add your first category to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredCategories.map((category) => (
                  <Card
                    key={category.id}
                    className={`border ${getCategoryColor(category.color)
                      .split(" ")
                      .slice(-2)
                      .join(" ")}`}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3 flex-1'>
                          <div
                            className={`p-2 rounded-lg border ${getCategoryColor(
                              category.color
                            )}`}
                          >
                            {getIcon(category.icon)}
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <h4 className='font-medium'>{category.name}</h4>
                              <Badge
                                variant={
                                  category.isIncome ? "default" : "secondary"
                                }
                              >
                                {category.isIncome ? "Income" : "Expense"}
                              </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                          >
                            <Edit className='w-3 h-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleDelete(category.id)}
                            disabled={loading}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                          >
                            <Trash2 className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
