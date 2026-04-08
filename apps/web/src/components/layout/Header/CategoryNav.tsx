'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Menu01Icon } from 'hugeicons-react';
import { categoriesQuery } from '@/lib/queries/catalog/queries';
import type { Category } from '@/lib/api/types';
import { Popover } from '@/components/ui/Popover';

function MegaMenuContent({ children }: { children: Category[] }) {
  if (!children.length) return null;
  return (
    <div
      className="p-5 grid gap-6"
      style={{ gridTemplateColumns: `repeat(${Math.min(children.length, 4)}, minmax(140px, 1fr))` }}
    >
      {children.map((child) => (
        <div key={child.id}>
          <Link href={`/category/${child.slug}`}>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5 hover:text-orange-500 transition-colors">
              {child.name}
            </p>
          </Link>
          {child.children?.length > 0 && (
            <ul className="space-y-1.5">
              {child.children.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/category/${sub.slug}`}
                    className="block text-sm text-text-primary hover:text-orange-500 transition-colors"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export function CategoryNav() {
  const [active, setActive] = useState<string | null>(null);
  const { data: categories = [], isLoading } = useQuery(categoriesQuery());

  return (
    <div className="bg-white border-t border-border">
      <div className="max-w-[1280px] mx-auto px-2">
        <div className="flex items-stretch overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {/* Static "All Categories" */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setActive('__all__')}
            onMouseLeave={() => setActive(null)}
          >
            <Link href="/categories">
              <div className="relative flex items-center gap-1.5 px-4 py-3 whitespace-nowrap cursor-pointer group">
                <Menu01Icon size={14} className="text-orange-500" />
                <span className="text-[13px] font-medium text-orange-500">All Categories</span>
                <span
                  className={[
                    'absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full transition-transform duration-150 origin-left',
                    active === '__all__' ? 'scale-x-100' : 'scale-x-0',
                  ].join(' ')}
                />
              </div>
            </Link>
            {categories.length > 0 && (
              <Popover open={active === '__all__'} minWidth={Math.min(categories.length, 4) * 160}>
                <MegaMenuContent children={categories} />
              </Popover>
            )}
          </div>

          {/* Dynamic top-level categories from API */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative shrink-0"
              onMouseEnter={() => setActive(cat.id)}
              onMouseLeave={() => setActive(null)}
            >
              <Link href={`/category/${cat.slug}`}>
                <div className="relative flex items-center px-4 py-3 whitespace-nowrap cursor-pointer group">
                  <span className="text-[13px] font-medium text-text-primary group-hover:text-orange-500 transition-colors">
                    {cat.name}
                  </span>
                  <span
                    className={[
                      'absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full transition-transform duration-150 origin-left',
                      active === cat.id ? 'scale-x-100' : 'scale-x-0',
                    ].join(' ')}
                  />
                </div>
              </Link>
              {cat.children?.length > 0 && (
                <Popover open={active === cat.id} minWidth={Math.min(cat.children.length, 4) * 160}>
                  <MegaMenuContent children={cat.children} />
                </Popover>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
