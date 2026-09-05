export default async function AdminDashboard() {
  // In production these would be fetched from the DB server-side.
  // Using fetch with absolute URL is needed in App Router server components.
  // Since admin pages are client components (sidebar uses usePathname),
  // we fetch from the admin stats API.
  return <AdminDashboardClient />;
}

// ─── Client component ─────────────────────────────────────────────────────────
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Stats = { totalOrders: number; pendingOrders: number; totalUsers: number; pendingListings: number };
type RecentOrder = { id: string; orderNumber: string; status: string; createdAt: string; user: { name: string }; game: { nameAr: string } | null; package: { price: number | null } | null };

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-500 bg-amber-500/10', PROCESSING: 'text-blue-500 bg-blue-500/10',
  COMPLETED: 'text-green-500 bg-green-500/10', CANCELLED: 'text-red-500 bg-red-500/10',
};

function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    // Fetch orders then compute stats from them
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then((data: RecentOrder[]) => {
        if (!Array.isArray(data)) return;
        setOrders(data.slice(0, 5));
        setStats({
          totalOrders: data.length,
          pendingOrders: data.filter(o => o.status === 'PENDING').length,
          totalUsers: 0, // Would need a separate endpoint
          pendingListings: 0,
        });
      })
      .catch(console.error);
  }, []);

  const statCards = [
    { label: 'إجمالي الطلبات', value: stats?.totalOrders ?? '…', icon: '📦' },
    { label: 'طلبات قيد الانتظار', value: stats?.pendingOrders ?? '…', icon: '⏳' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">لوحة التحكم</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border rounded-2xl p-5 shadow-sm">
            <p className="text-3xl mb-3">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
        <Link href="/ar/admin/listings" className="bg-card border rounded-2xl p-5 shadow-sm hover:border-primary transition-colors">
          <p className="text-3xl mb-3">🏪</p>
          <p className="text-sm font-bold">حسابات البيع</p>
          <p className="text-xs text-muted-foreground mt-1">إدارة الإعلانات</p>
        </Link>
        <Link href="/ar/admin/reviews" className="bg-card border rounded-2xl p-5 shadow-sm hover:border-primary transition-colors">
          <p className="text-3xl mb-3">⭐</p>
          <p className="text-sm font-bold">التقييمات</p>
          <p className="text-xs text-muted-foreground mt-1">إدارة التقييمات</p>
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">أحدث الطلبات</h2>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">رقم الطلب</th>
              <th className="px-4 py-3 text-start font-medium">العميل</th>
              <th className="px-4 py-3 text-start font-medium">اللعبة</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
              <th className="px-4 py-3 text-start font-medium">السعر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا توجد طلبات بعد</td></tr>
            )}
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold">#{o.orderNumber}</td>
                <td className="px-4 py-3">{o.user?.name}</td>
                <td className="px-4 py-3">{o.game?.nameAr ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{o.package?.price ?? '—'} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
