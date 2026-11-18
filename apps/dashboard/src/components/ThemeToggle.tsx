'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('convoza_theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
    } catch {
      setTheme('light');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);

    try {
      const root = document.documentElement;
      root.classList.add('theme-transition');
      root.classList.toggle('dark', next === 'dark');
      root.style.colorScheme = next;
      localStorage.setItem('convoza_theme', next);
      window.setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 250);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={mounted ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Toggle theme'}
      aria-label="Toggle Dark or Light Mode"
      className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs ${className}`}
    >
      {!mounted ? (
        <span className="w-4 h-4 block" />
      ) : theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};
