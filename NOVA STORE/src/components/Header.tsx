'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Logo from './Logo';
import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  ShoppingCart,
  ChevronDown,
  User,
  Settings,
  ClipboardList,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const t = useTranslations('Navigation');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  useEffect(() => setMounted(true), []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const currentLocale = document.documentElement.lang;
    const nextLocale = currentLocale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.replace('/');
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/games', label: t('games') },
    { href: '/steam', label: t('steam') },
    { href: '/buy-sell', label: t('buySellAccounts') },
  ];

  // Cart item count (placeholder — will be wired when CartContext exists)
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">NOVA STORE</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Toggle language"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-md hover:bg-accent" aria-label={t('cart')}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth section — only render after loading is done to avoid flicker */}
          {!loading && (
            <>
              {user ? (
                /* ── Logged-in user dropdown ── */
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-accent text-sm font-medium"
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute end-0 mt-2 w-48 rounded-xl border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {/* Admin Settings — only in DOM for ADMIN role */}
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-primary font-medium"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {t('adminSettings')}
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {t('settings')}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                        {t('orders')}
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Logged-out buttons ── */
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — smooth transition via max-height */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t p-4 flex flex-col gap-3 bg-background">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <hr className="my-1 border-border" />

          {!loading && (
            <>
              {user ? (
                <>
                  <p className="text-xs text-muted-foreground px-0.5">{user.name}</p>
                  {/* Admin link — only in DOM for ADMIN role */}
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-sm font-medium py-2 text-primary hover:text-primary/80 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t('adminSettings')}
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 text-sm font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    {t('settings')}
                  </Link>
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 text-sm font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ClipboardList className="w-4 h-4" />
                    {t('orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium py-2 text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium py-2 text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
