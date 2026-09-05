"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/ar/admin', label: 'لوحة التحكم', icon: '📊' },
  { href: '/ar/admin/games', label: 'الألعاب', icon: '🎮' },
  { href: '/ar/admin/orders', label: 'الطلبات', icon: '📦' },
  { href: '/ar/admin/listings', label: 'حسابات البيع', icon: '🏪' },
  { href: '/ar/admin/reviews', label: 'التقييمات', icon: '⭐' },
  { href: '/ar/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-e bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="font-bold text-lg">NOVA STORE</h1>
          <p className="text-xs text-muted-foreground mt-1">لوحة الإدارة</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== '/ar/admin' && pathname.startsWith(item.href))
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              document.cookie = 'token=; Max-Age=0; path=/;';
              window.location.href = '/';
            }}
            className="w-full py-2 text-sm text-destructive border border-destructive/30 rounded-md hover:bg-destructive/10"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
