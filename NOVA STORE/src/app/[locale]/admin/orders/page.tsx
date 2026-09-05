"use client"

import { useState, useEffect } from 'react';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  aiVerificationResult: string | null;
  createdAt: string;
  user: { name: string; phone: string };
  game: { nameAr: string; nameEn: string } | null;
  package: { nameAr: string; price: number | null } | null;
};

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
const AI_COLOR: Record<string, string> = {
  likely_valid: 'text-green-600 bg-green-500/10',
  needs_review: 'text-amber-600 bg-amber-500/10',
  likely_invalid: 'text-red-600 bg-red-500/10',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-500', PROCESSING: 'text-blue-500',
  COMPLETED: 'text-green-500', CANCELLED: 'text-red-500',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">إدارة الطلبات</h1>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">رقم الطلب</th>
                  <th className="px-4 py-3 text-start font-medium">العميل</th>
                  <th className="px-4 py-3 text-start font-medium">اللعبة / الباقة</th>
                  <th className="px-4 py-3 text-start font-medium">AI</th>
                  <th className="px-4 py-3 text-start font-medium">الحالة</th>
                  <th className="px-4 py-3 text-start font-medium">السعر</th>
                  <th className="px-4 py-3 text-start font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">لا توجد طلبات بعد</td></tr>
                )}
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-semibold text-xs">#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p>{order.user?.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{order.user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{order.game?.nameAr ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{order.package?.nameAr ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {order.aiVerificationResult ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${AI_COLOR[order.aiVerificationResult] ?? ''}`}>
                          {order.aiVerificationResult.replace(/_/g, ' ')}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold bg-transparent border border-border rounded px-2 py-1 ${STATUS_COLOR[order.status] ?? ''}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 font-semibold">{order.package?.price ?? '—'} EGP</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
