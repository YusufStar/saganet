'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search01Icon } from 'hugeicons-react';
import { categoriesQuery } from '@/lib/queries/catalog/queries';
import { Popover } from '@/components/ui/Popover';

const ALL = 'All Categories';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useQuery(categoriesQuery());

  const selectedName = selectedId
    ? (categories.find((c) => c.id === selectedId)?.name ?? ALL)
    : ALL;

  const buttonLabel = selectedName === ALL ? 'All' : selectedName;

  return (
    <div className="flex-1 max-w-[640px] relative">
      <div
        className={[
          'flex items-stretch rounded-(--radius-md) border-2 transition-colors duration-150',
          'bg-(--color-neutral-50)',
          focused ? 'border-orange-500' : 'border-(--color-border)',
        ].join(' ')}
      >
        {/* Category selector */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            className="flex items-center gap-1 px-3 h-full text-xs font-medium text-(--color-text-secondary) bg-(--color-neutral-100) border-r border-(--color-border) hover:bg-(--color-neutral-200) transition-colors whitespace-nowrap rounded-l-[calc(var(--radius-md)-2px)] max-w-[120px] truncate"
          >
            <span className="truncate">{buttonLabel}</span>
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <Popover open={catOpen} onClose={() => setCatOpen(false)} minWidth={196}>
            <ul className="py-1 max-h-72 overflow-y-auto">
              {/* All categories option */}
              <li>
                <button
                  type="button"
                  onMouseDown={() => { setSelectedId(null); setCatOpen(false); }}
                  className={[
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    !selectedId
                      ? 'text-orange-500 font-medium bg-orange-50'
                      : 'text-(--color-text-primary) hover:bg-orange-50 hover:text-orange-500',
                  ].join(' ')}
                >
                  {ALL}
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onMouseDown={() => { setSelectedId(cat.id); setCatOpen(false); }}
                    className={[
                      'w-full text-left px-4 py-2 text-sm transition-colors',
                      selectedId === cat.id
                        ? 'text-orange-500 font-medium bg-orange-50'
                        : 'text-(--color-text-primary) hover:bg-orange-50 hover:text-orange-500',
                    ].join(' ')}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </Popover>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search for products, brands or categories..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-(--color-text-primary) placeholder:text-(--color-text-muted) min-w-0"
        />

        {/* Search button */}
        <button
          type="button"
          className="px-5 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center rounded-r-[calc(var(--radius-md)-2px)] transition-colors duration-150 flex-shrink-0"
        >
          <Search01Icon size={20} />
        </button>
      </div>

      {/* Search suggestions — static popular terms, no API needed yet */}
      <Popover open={focused && !catOpen && query.length > 0} minWidth={400} className="w-full">
        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-(--color-text-muted) uppercase tracking-wider">
          Results
        </div>
        <div className="px-4 py-3 text-sm text-(--color-text-muted)">
          Press Enter to search for &ldquo;{query}&rdquo;
          {selectedId && (
            <span className="text-orange-500"> in {selectedName}</span>
          )}
        </div>
      </Popover>
    </div>
  );
}
