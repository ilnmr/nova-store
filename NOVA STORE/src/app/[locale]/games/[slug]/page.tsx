"use client"

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { generateOrderMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import { useCart } from '@/context/CartContext';

type GameField = {
  id: string; key: string; labelAr: string; labelEn: string;
  type: string; required: boolean; minLength?: number | null; maxLength?: number | null;
  order: number;
};

type Package = {
  id: string; nameAr: string; nameEn: string; price?: number | null; imageUrl?: string | null;
};

type Game = {
  id: string; slug: string; nameAr: string; nameEn: string;
  imageUrl: string; descriptionAr?: string; descriptionEn?: string;
  fields: GameField[]; packages: Package[];
};

type OrderStep = 'select' | 'id-entry' | 'payment' | 'done';

export default function GameTopupPage({ params }: { params: { slug: string; locale: string } }) {
  const t = useTranslations('Games');
  const locale = params.locale || 'ar';

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<OrderStep>('select');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [verifyStatus, setVerifyStatus] = useState<'idle'|'verifying'|'unverified'>('idle');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [cartAdded, setCartAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedPackage || !game || selectedPackage.price == null) return;
    if (!validateFields()) return;
    addItem({
      id: selectedPackage.id,
      gameSlug: game.slug,
      gameName: locale === 'ar' ? game.nameAr : game.nameEn,
      packageName: locale === 'ar' ? selectedPackage.nameAr : selectedPackage.nameEn,
      price: selectedPackage.price,
      fieldValues,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  useEffect(() => {
    fetch(`/api/games/${params.slug}`)
      .then(r => r.json())
      .then(data => { if (data.id) setGame(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Trigger ID verification when all fields have values
  useEffect(() => {
    if (!game) return;
    const allFilled = game.fields.every(f => !f.required || (fieldValues[f.key]?.length ?? 0) > 0);
    if (!allFilled) { setVerifyStatus('idle'); return; }
    setVerifyStatus('verifying');
    const timer = setTimeout(() => setVerifyStatus('unverified'), 1200);
    return () => clearTimeout(timer);
  }, [fieldValues, game]);

  const validateFields = () => {
    if (!game) return false;
    const errors: Record<string, string> = {};
    for (const field of game.fields) {
      const val = fieldValues[field.key] || '';
      if (field.required && !val) {
        errors[field.key] = locale === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      } else if (field.minLength && val.length < field.minLength) {
        errors[field.key] = locale === 'ar'
          ? `أقل عدد أحرف: ${field.minLength}`
          : `Minimum length: ${field.minLength}`;
      } else if (field.maxLength && val.length > field.maxLength) {
        errors[field.key] = locale === 'ar'
          ? `أكبر عدد أحرف: ${field.maxLength}`
          : `Maximum length: ${field.maxLength}`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateFields() || !selectedPackage || !game) return;
    // Create order
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId: game.id,
        packageId: selectedPackage.id,
        submittedFieldValues: fieldValues,
        paymentMethod: 'vodafone_cash',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      setOrderId(data.orderId);
      setStep('payment');
    } else {
      const e = await res.json();
      alert(e.error || 'حدث خطأ');
    }
  };

  const handlePaymentUpload = async () => {
    if (!paymentFile || !orderId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', paymentFile);
    const res = await fetch(`/api/orders/${orderId}/screenshot`, {
      method: 'POST', body: formData,
    });
    setUploading(false);
    if (res.ok) {
      // Also send WhatsApp notification
      const msg = generateOrderMessage(
        orderNumber,
        locale === 'ar' ? game?.nameAr ?? '' : game?.nameEn ?? '',
        locale === 'ar' ? selectedPackage?.nameAr ?? '' : selectedPackage?.nameEn ?? '',
        `${selectedPackage?.price ?? '?'} EGP`
      );
      window.open(generateWhatsAppLink('201556723459', msg), '_blank');
      setStep('done');
    } else {
      alert('فشل رفع الإيصال، حاول مرة أخرى');
    }
  };

  const name = (g: Game) => locale === 'ar' ? g.nameAr : g.nameEn;
  const pkgName = (p: Package) => locale === 'ar' ? p.nameAr : p.nameEn;
  const fieldLabel = (f: GameField) => locale === 'ar' ? f.labelAr : f.labelEn;

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="text-4xl mb-4 animate-pulse">🎮</div>
      <p className="text-muted-foreground">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
    </div>
  );

  if (!game) return (
    <div className="container py-20 text-center">
      <p className="text-2xl font-bold">404</p>
      <p className="text-muted-foreground mt-2">{locale === 'ar' ? 'اللعبة مش موجودة' : 'Game not found'}</p>
    </div>
  );

  return (
    <div className="container py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center text-3xl">🎮</div>
        <div>
          <h1 className="text-3xl font-bold">{name(game)}</h1>
          {game.descriptionAr && <p className="text-muted-foreground mt-1">{locale === 'ar' ? game.descriptionAr : game.descriptionEn}</p>}
        </div>
      </div>

      {/* Step: Done */}
      {step === 'done' && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold mb-2">{locale === 'ar' ? 'تم إرسال طلبك!' : 'Order Submitted!'}</h2>
          <p className="text-muted-foreground mb-2">{locale === 'ar' ? 'رقم طلبك:' : 'Your order number:'}</p>
          <p className="font-mono text-xl font-bold text-primary">#{orderNumber}</p>
          <p className="text-sm text-muted-foreground mt-4">
            {locale === 'ar'
              ? 'سيتم التحقق من الدفع وشحن حسابك خلال دقائق.'
              : 'Your payment will be verified and account topped up within minutes.'}
          </p>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <div className="max-w-md mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 text-sm">
            <p className="font-semibold text-amber-600 mb-1">💳 {locale === 'ar' ? 'خطوات الدفع' : 'Payment Steps'}</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>{locale === 'ar' ? 'حوّل المبلغ عبر فودافون كاش لرقم الدعم' : 'Transfer the amount via Vodafone Cash to the support number'}</li>
              <li>{locale === 'ar' ? 'ارفع صورة إيصال الدفع' : 'Upload the payment receipt screenshot'}</li>
            </ol>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="font-semibold mb-1">{locale === 'ar' ? 'طلب:' : 'Order:'} #{orderNumber}</p>
            <p className="text-muted-foreground text-sm mb-6">
              {pkgName(selectedPackage!)} — <strong>{selectedPackage?.price ?? '?'} EGP</strong>
            </p>
            <label className="block text-sm font-medium mb-2">
              {locale === 'ar' ? 'صورة إيصال الدفع' : 'Payment Receipt Screenshot'}
            </label>
            <input
              type="file" accept="image/jpeg,image/png,image/webp"
              onChange={e => setPaymentFile(e.target.files?.[0] ?? null)}
              className="w-full px-4 py-2 bg-input border border-border rounded-md text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
            />
            <button
              onClick={handlePaymentUpload}
              disabled={!paymentFile || uploading}
              className="w-full mt-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? (locale === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (locale === 'ar' ? 'إرسال الطلب' : 'Submit Order')}
            </button>
          </div>
        </div>
      )}

      {/* Step: select + id-entry */}
      {(step === 'select' || step === 'id-entry') && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Packages */}
          <div className="md:col-span-7">
            <h2 className="text-xl font-semibold mb-4">{t('selectPackage')}</h2>
            {game.packages.length === 0 ? (
              <p className="text-muted-foreground">{locale === 'ar' ? 'لا توجد باقات متاحة حالياً' : 'No packages available yet'}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {game.packages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPackage(pkg); setStep('id-entry'); }}
                    className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                      selectedPackage?.id === pkg.id
                        ? 'border-primary ring-2 ring-primary bg-primary/10'
                        : 'bg-card hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    {pkg.imageUrl
                      ? <img src={pkg.imageUrl} alt={pkgName(pkg)} className="w-12 h-12 rounded-lg object-cover" />
                      : <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center text-xl">💎</div>
                    }
                    <span className="font-semibold text-sm text-center">{pkgName(pkg)}</span>
                    {pkg.price != null
                      ? <span className="text-primary font-bold">{pkg.price} EGP</span>
                      : <span className="text-xs text-muted-foreground border border-dashed border-border rounded px-2 py-0.5">
                          {locale === 'ar' ? 'السعر قريباً' : 'Price Soon'}
                        </span>
                    }
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ID Entry */}
          {step === 'id-entry' && selectedPackage && (
            <div className="md:col-span-5">
              <div className="bg-card border rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-1">{locale === 'ar' ? 'بيانات الحساب' : 'Account Details'}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {pkgName(selectedPackage)} — <strong>{selectedPackage.price ?? '?'} EGP</strong>
                </p>

                <div className="space-y-4">
                  {game.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium mb-1">{fieldLabel(field)}</label>
                      <input
                        type={field.type === 'number' ? 'text' : field.type}
                        inputMode={field.type === 'number' ? 'numeric' : undefined}
                        pattern={field.type === 'number' ? '[0-9]*' : undefined}
                        value={fieldValues[field.key] || ''}
                        onChange={e => setFieldValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        maxLength={field.maxLength ?? undefined}
                        dir="ltr"
                        placeholder={field.type === 'number' ? '123456789' : ''}
                        className={`w-full px-4 py-2 bg-input border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${
                          fieldErrors[field.key] ? 'border-destructive' : 'border-border'
                        }`}
                      />
                      {fieldErrors[field.key] && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors[field.key]}</p>
                      )}
                    </div>
                  ))}

                  {/* Verification badge */}
                  <div className="min-h-[24px] text-sm">
                    {verifyStatus === 'verifying' && (
                      <span className="text-muted-foreground animate-pulse">⟳ {t('verifyId')}</span>
                    )}
                    {verifyStatus === 'unverified' && (
                      <span className="text-amber-500 font-medium">⚠ {t('idUnverified')}</span>
                    )}
                  </div>

                  {cartAdded && (
                    <p className="text-green-500 text-sm font-medium text-center">✓ {locale === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to cart!'}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedPackage || selectedPackage.price == null}
                      className="flex-1 py-3 border border-primary text-primary font-semibold rounded-md hover:bg-primary/10 disabled:opacity-50 transition-colors text-sm"
                    >
                      🛒 {locale === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={!selectedPackage || selectedPackage.price == null}
                      className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                    >
                      {selectedPackage?.price == null
                        ? (locale === 'ar' ? 'السعر غير متاح' : 'Price not set')
                        : t('checkout')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
