import Link from 'next/link';

const links = [
  { label: 'Become a Seller', href: '/seller' },
  { label: 'Stores', href: '/stores' },
  { label: 'Help Center', href: '/support' },
  { label: 'Discount Coupons', href: '/coupons' },
];

export function TopBar() {
  return (
    <div className="bg-orange-500 text-white text-xs">
      <div className="max-w-[1280px] mx-auto px-6 h-8 flex items-center justify-between">
        <span className="font-medium tracking-wide">Welcome to Saganet!</span>
        <nav className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:opacity-75 hover:underline underline-offset-2 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
