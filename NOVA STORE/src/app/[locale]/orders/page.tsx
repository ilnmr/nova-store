"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

type Order = {
  id: string; orderNumber: string; paymentMethod: string;
  status: string; createdAt: string; aiVerificationResult?: string;
  game?: { nameAr: string; nameEn: string } | null;
  package?: { nameAr: string; nameEn: string; price?: number | null } | null;
};

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  PENDING:    { ar: 'قيد الانتظار', en: 'Pending',    color: 'text-amber-500 bg-amber-500/10' },
  PROCESSING: { ar: 'جاري التنفيذ', en: 'Processing', color: 'text-blue-500 bg-blue-500/10' },
  COMPLETED:  { ar: 'مكتمل',        en: 'Completed',  color: 'text-green-500 bg-green-500/10' },
  CANCELLED:  { ar: 'ملغي',         en: 'Cancelled',  color: 'text-red-500 bg-red-500/10' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="container py-20 text-center">
      <p className="text-muted-foreground">{locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first'}</p>
    </div>
  );

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">{locale === 'ar' ? 'طلباتي' : 'My Orders'}</h1>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-lg">{locale === 'ar' ? 'مافيش طلبات لحد دلوقتي' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING;
            const gameName = order.game ? (locale === 'ar' ? order.game.nameAr : order.game.nameEn) : '—';
            const pkgName  = order.package ? (locale === 'ar' ? order.package.nameAr : order.package.nameEn) : '—';
            return (
              <div key={order.id} className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-mono text-sm text-muted-foreground">#{order.orderNumber}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                      {locale === 'ar' ? st.ar : st.en}
                    </span>
                  </div>
                  <p className="font-semibold">{gameName} — {pkgName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                  </p>
                </div>
                <div className="text-start sm:text-end">
                  <p className="font-bold text-lg">{order.package?.price ?? '—'} EGP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
