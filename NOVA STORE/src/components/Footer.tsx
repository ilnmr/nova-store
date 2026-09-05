"use client"

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('Footer');
  const tNav = useTranslations('Navigation');

  return (
    <footer className="border-t bg-muted/40 py-8">
      <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">NOVA STORE</h3>
          <p className="text-sm text-muted-foreground">
            The best platform for game top-ups and accounts in Egypt.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">{t('quickLinks')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/games" className="hover:text-primary">{tNav('games')}</Link></li>
            <li><Link href="/steam" className="hover:text-primary">{tNav('steam')}</Link></li>
            <li><Link href="/buy-sell" className="hover:text-primary">{tNav('buySellAccounts')}</Link></li>
            <li><Link href="/contact" className="hover:text-primary">{tNav('customerSupport')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">{t('followUs')}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="http://tiktok.com/@novastore504" target="_blank" rel="noreferrer" className="hover:text-primary">TikTok</a></li>
            <li><a href="https://www.facebook.com/share/1Co84EHcpf/" target="_blank" rel="noreferrer" className="hover:text-primary">Facebook</a></li>
            <li><a href="https://whatsapp.com/channel/0029Vb8OlWRATRSpCJeBQC1K" target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp Channel</a></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-2">
        <p className="text-sm font-medium">{t('rights')}</p>
        <a 
          href="https://instagram.com/youssefgraphicdesigner" 
          target="_blank" 
          rel="noreferrer" 
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t('developedBy')}
        </a>
      </div>
    </footer>
  );
}
