'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<'dark' | 'light'>;
      if (custom.detail) setTheme(custom.detail);
    };
    window.addEventListener('convoza-theme-change', handleSync);
    return () => window.removeEventListener('convoza-theme-change', handleSync);
  }, []);

  const toggleTheme = () => {
    const nextTheme: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', nextTheme === 'dark');
    try {
      localStorage.setItem('convoza_theme', nextTheme);
    } catch {}
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent('convoza-theme-change', { detail: nextTheme }));
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 220);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={mounted ? `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode` : 'Toggle theme'}
      aria-label="Toggle color theme"
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer overflow-hidden ${className}`}
    >
      <Sun
        className={`w-4 h-4 text-amber-500 transition-all duration-300 transform ${
          mounted && theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
      />
      <Moon
        className={`w-4 h-4 text-sky-400 transition-all duration-300 transform ${
          !mounted || theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0 absolute'
        }`}
      />
    </button>
  );
};
