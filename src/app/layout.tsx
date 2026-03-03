import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://piptray.com'),
  title: {
    default: 'PipTray - Precision Trading. Proven Results.',
    template: '%s | PipTray',
  },
  description:
    'The trusted signal marketplace for East African traders. Connect with verified signal providers, see real performance stats, and trade with confidence.',
  keywords: [
    'piptray',
    'PipTray',
    'forex signals Uganda',
    'crypto signals East Africa',
    'verified signal providers',
    'trading signals marketplace',
    'forex trading Uganda',
    'crypto trading Africa',
    'signal provider platform',
    'verified trading signals',
    'mobile money trading',
    'trading signals Africa',
    'forex signals Kenya',
    'crypto signals Tanzania',
  ],
  authors: [{ name: 'HAMCODZ', url: 'https://github.com/hamtechug256' }],
  creator: 'HAMCODZ',
  publisher: 'PipTray',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'PipTray - Precision Trading. Proven Results.',
    description:
      'Your trusted signal marketplace for East African traders. Connect with verified signal providers and see real performance stats.',
    url: 'https://piptray.com',
    siteName: 'PipTray',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PipTray - Signal Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PipTray - Precision Trading. Proven Results.',
    description: 'Your trusted signal marketplace for East African traders.',
    creator: '@hamcodz',
  },
  alternates: {
    canonical: 'https://piptray.com',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#2563eb' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://piptray.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PipTray" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
