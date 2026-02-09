import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Task Dashboard | لوحة المهام',
  description: 'Manage your team tasks efficiently | إدارة مهام فريقك بكفاءة',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${inter.variable} ${cairo.variable} antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t||(p?'dark':'light');document.documentElement.classList.toggle('dark',d==='dark');})();`,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
