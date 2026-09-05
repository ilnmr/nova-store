"use client"

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

type Review = {
  id: string; rating: number; comment: string | null;
  createdAt: string; hidden?: boolean;
  user: { name: string };
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteReview = async (id: string) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">إدارة التقييمات</h1>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">لا توجد تقييمات بعد</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-card border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold">{review.user?.name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm">{review.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-xs px-3 py-1 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
