import { useTranslations } from 'next-intl';

export default function SteamPage() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Steam Top-up</h1>
        <p className="text-muted-foreground mt-2">شحن رصيد ستيم — اختر الباقة وأدخل إيميلك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { name: 'Steam Wallet $5', image: null },
          { name: 'Steam Wallet $10', image: null },
          { name: 'Steam Wallet $20', image: null },
          { name: 'Steam Wallet $50', image: null },
        ].map((pkg) => (
          <div key={pkg.name} className="bg-card border rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div className="w-full h-32 bg-muted rounded-xl flex items-center justify-center">
              <span className="text-4xl">🎮</span>
            </div>
            <h3 className="font-bold text-lg">{pkg.name}</h3>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-muted-foreground text-sm border border-dashed border-border rounded px-2 py-1">
                السعر قريباً / Price Soon
              </span>
              <button
                disabled
                className="px-4 py-2 text-sm rounded-md bg-primary/30 text-muted-foreground cursor-not-allowed"
              >
                تواصل معنا
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Steam Order Form */}
      <div className="bg-card text-card-foreground border rounded-2xl shadow-sm p-6 md:p-8 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-2">اطلب الآن</h2>
        <p className="text-muted-foreground text-sm mb-6">أدخل إيميل ستيم بتاعك وسنتواصل معك بالسعر</p>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('سيتم التواصل معك قريباً'); }}>
          <div>
            <label className="block text-sm font-medium mb-1">Steam Email</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              dir="ltr"
              required
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Email (اختياري)</label>
            <input
              type="email"
              placeholder="yourname@gmail.com"
              dir="ltr"
              className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الباقة المطلوبة</label>
            <select className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">اختر الباقة</option>
              <option>Steam Wallet $5</option>
              <option>Steam Wallet $10</option>
              <option>Steam Wallet $20</option>
              <option>Steam Wallet $50</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            إرسال الطلب
          </button>
        </form>
      </div>
    </div>
  );
}
