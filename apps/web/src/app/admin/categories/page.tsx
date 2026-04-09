'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Add01Icon,
  Edit01Icon,
  Delete01Icon,
  ArrowRight01Icon,
  FolderOpenIcon,
} from 'hugeicons-react';
import { categoriesQuery } from '@/lib/queries/catalog/queries';
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/queries/catalog/mutations';
import type { Category } from '@/lib/api/types';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useQuery(categoriesQuery());

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createParentId, setCreateParentId] = useState('');

  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Flatten categories for parent selector
  const flatCategories = (cats: Category[], depth = 0): { id: string; name: string; depth: number }[] => {
    const result: { id: string; name: string; depth: number }[] = [];
    for (const c of cats) {
      result.push({ id: c.id, name: c.name, depth });
      if (c.children?.length) {
        result.push(...flatCategories(c.children, depth + 1));
      }
    }
    return result;
  };

  const flat = categories ? flatCategories(categories) : [];

  const handleCreate = () => {
    if (!createName.trim()) return;
    createCategory.mutate(
      { name: createName.trim(), parentId: createParentId || undefined },
      {
        onSuccess: () => {
          setCreateName('');
          setCreateParentId('');
          setShowCreate(false);
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editTarget || !editName.trim()) return;
    updateCategory.mutate(
      { id: editTarget.id, body: { name: editName.trim() } },
      {
        onSuccess: () => setEditTarget(null),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const countProducts = (cat: Category): number => {
    let count = cat.children?.length ?? 0;
    if (cat.children) {
      for (const child of cat.children) {
        count += countProducts(child);
      }
    }
    return count;
  };

  const renderCategory = (cat: Category, depth: number) => (
    <div key={cat.id}>
      <div
        className={`flex items-center gap-3 px-5 py-3 border-b border-border-light hover:bg-neutral-50 transition-colors group ${
          depth > 0 ? 'bg-neutral-50/50' : ''
        }`}
        style={{ paddingLeft: `${20 + depth * 24}px` }}
      >
        {depth > 0 && (
          <ArrowRight01Icon size={14} className="text-text-disabled shrink-0" />
        )}
        <FolderOpenIcon size={18} className="text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{cat.name}</p>
          <p className="text-xs text-text-muted">{cat.slug}</p>
        </div>
        {cat.children?.length > 0 && (
          <span className="text-xs text-text-muted">
            {cat.children.length} sub
          </span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditTarget(cat);
              setEditName(cat.name);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-neutral-200 transition-colors"
            title="Edit"
          >
            <Edit01Icon size={15} className="text-text-secondary" />
          </button>
          <button
            onClick={() => setDeleteTarget(cat)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Delete01Icon size={15} className="text-error" />
          </button>
        </div>
      </div>
      {cat.children?.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <p className="text-sm text-text-secondary mt-1">Manage product category tree</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600 flex items-center gap-1.5"
        >
          <Add01Icon size={16} />
          New Category
        </button>
      </div>

      {/* Category Tree */}
      <div className="bg-surface rounded-lg border border-border">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-5 w-48" />
            ))}
          </div>
        ) : !categories?.length ? (
          <div className="py-16 text-center text-sm text-text-muted">
            No categories yet
          </div>
        ) : (
          categories.map((cat) => renderCategory(cat, 0))
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">New Category</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Category name"
                  className="input w-full h-9 text-sm rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">Parent Category</label>
                <select
                  value={createParentId}
                  onChange={(e) => setCreateParentId(e.target.value)}
                  className="input w-full h-9 text-sm rounded-md"
                >
                  <option value="">None (root category)</option>
                  {flat.map((c) => (
                    <option key={c.id} value={c.id}>
                      {'—'.repeat(c.depth)} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowCreate(false)} className="btn btn-sm btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || createCategory.isPending}
                className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Edit Category</h3>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input w-full h-9 text-sm rounded-md"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditTarget(null)} className="btn btn-sm btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!editName.trim() || updateCategory.isPending}
                className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Delete Category</h3>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              {deleteTarget.children?.length > 0 && (
                <span className="text-error"> This category has {deleteTarget.children.length} subcategories.</span>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="btn btn-sm btn-ghost">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCategory.isPending}
                className="btn btn-sm bg-error text-white hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
