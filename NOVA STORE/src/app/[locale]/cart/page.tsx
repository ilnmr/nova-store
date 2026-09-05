"use client"

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { generateOrderMessage, generateWhatsAppLink } from '@/lib/whatsapp';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const locale = typeof document !== 'undefined' ? document.documentElement.lang : 'ar';

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);

    // Create orders for each item
    const results: string[] = [];
    for (const item of items) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: null, // resolved by slug server-side if needed
          packageId: item.id,
          submittedFieldValues: item.fieldValues,
          paymentMethod: 'vodafone_cash',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        results.push(data.orderNumber);
      }
    }

    // Open WhatsApp with all order numbers
    if (results.length > 0) {
      const msg = results.map(num => generateOrderMessage(num, '', '', '')).join('\n---\n');
      window.open(generateWhatsAppLink('201556723459', `طلبات جديدة:\n${results.map(n => `#${n}`).join(', ')}`), '_blank');
      clearCart();
      router.push('/orders');
    }
    setCheckingOut(false);
  };

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{locale === 'ar' ? 'السلة' : 'Cart'}</h1>

      {items.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg">{locale === 'ar' ? 'سلتك فاضية' : 'Your cart is empty'}</p>
          <button onClick={() => router.push('/games')} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors">
            {locale === 'ar' ? 'تصفح الألعاب' : 'Browse Games'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-card border rounded-2xl p-4 flex items-start gap-4 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">🎮</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{item.gameName}</p>
                  <p className="text-sm text-muted-foreground">{item.packageName}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Object.entries(item.fieldValues).map(([k, v]) => (
                      <span key={k} className="me-3">{k}: <span dir="ltr">{v}</span></span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="font-bold">{(item.price * item.quantity).toLocaleString()} EGP</p>
                  <div className="flex items-center gap-2 border rounded-md px-2">
                    <button onClick={() => updateQty(item.id, -1)} className="py-1 text-lg font-bold w-6 text-center">−</button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="py-1 text-lg font-bold w-6 text-center">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-destructive hover:underline">
                    {locale === 'ar' ? 'حذف' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-4">
            <div className="bg-card border rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold mb-4">{locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{total.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between font-bold text-base mt-4 pt-4 border-t">
                <span>{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span>{total.toLocaleString()} EGP</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full mt-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {checkingOut ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (locale === 'ar' ? 'إتمام الطلب' : 'Checkout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
