import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CONVOZA Super Admin — Platform Control Plane',
  description: 'Master Super Admin Control Plane operated by Emperor Smart Solutions',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
      { url: '/apple-touch-icon.png', sizes: '32x32' },
    ],
    shortcut: '/icon.svg',
  },
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('convoza_theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
