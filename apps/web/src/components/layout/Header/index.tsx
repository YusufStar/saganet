import Link from 'next/link';
import { TopBar } from './TopBar';
import { SearchBar } from './SearchBar';
import { UserActions } from './UserActions';
import { CategoryNav } from './CategoryNav';

export function Header() {
  return (
    <header className="sticky top-0 z-(--z-header) w-full">
      <TopBar />

      <div className="bg-white shadow-(--shadow-header)">
        {/* Main row */}
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-9 h-9 bg-orange-500 rounded-(--radius-md) flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-lg leading-none">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[18px] font-black text-(--color-text-primary) tracking-tight group-hover:text-orange-500 transition-colors">
                saganet
              </span>
              <span className="text-[9px] font-semibold text-orange-500 tracking-[0.15em] uppercase -mt-0.5">
                marketplace
              </span>
            </div>
          </Link>

          <SearchBar />
          <UserActions />
        </div>

        {/* Category nav */}
        <CategoryNav />
      </div>
    </header>
  );
}
