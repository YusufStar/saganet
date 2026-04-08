import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-orange-500 rounded-md flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-xl leading-none">S</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[20px] font-black text-text-primary tracking-tight group-hover:text-orange-500 transition-colors">
            saganet
          </span>
          <span className="text-[9px] font-semibold text-orange-500 tracking-[0.15em] uppercase -mt-0.5">
            marketplace
          </span>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-card border border-border p-8">
        {children}
      </div>
    </div>
  );
}
