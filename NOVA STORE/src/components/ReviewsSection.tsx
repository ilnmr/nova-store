"use client"

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user: { name: string };
};

export default function ReviewsSection({
  targetType = 'store',
  targetId = '',
}: {
  targetType?: string;
  targetId?: string;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = () => {
    const params = new URLSearchParams({ targetType });
    if (targetId) params.set('targetId', targetId);
    fetch(`/api/reviews?${params}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [targetType, targetId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId: targetId || undefined, rating, comment }),
    });
    if (res.ok) {
      setSubmitted(true);
      setComment('');
      setRating(5);
      fetchReviews();
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold">آراء العملاء</h2>
        {avgRating && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="font-bold">{avgRating}</span>
            <span className="text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user && !submitted && (
        <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm max-w-xl">
          <h3 className="font-semibold mb-4">اترك تقييمك</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Picker */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="شاركنا تجربتك..."
              rows={3}
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="p-4 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl mb-8 text-sm">
          ✓ شكراً على تقييمك!
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-card border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {review.user.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{review.user.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
