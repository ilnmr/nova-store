"use client"

import { useState, useEffect } from 'react';

type Listing = {
  id: string; game: string; accountDetails: string; priceRequested: number;
  status: string; createdAt: string;
  user: { name: string; phone: string };
};

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'SOLD'];
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-amber-500', APPROVED: 'text-green-500',
  REJECTED: 'text-red-500', SOLD: 'text-blue-500',
};

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/listings')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setListings(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">حسابات البيع والشراء</h1>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">لا توجد إعلانات بعد</p>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-card border rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold">{listing.game}</p>
                    <span className={`text-xs font-medium ${STATUS_COLOR[listing.status]}`}>● {listing.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">البائع: {listing.user?.name} — <span dir="ltr">{listing.user?.phone}</span></p>
                  <p className="text-sm mt-2 line-clamp-2">{listing.accountDetails}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(listing.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <p className="font-bold text-lg">{listing.priceRequested.toLocaleString()} EGP</p>
                  <select
                    value={listing.status}
                    onChange={e => updateStatus(listing.id, e.target.value)}
                    className={`text-xs font-semibold bg-transparent border border-border rounded px-2 py-1 ${STATUS_COLOR[listing.status]}`}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
