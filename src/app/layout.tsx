import type { Metadata } from 'next';
import { Providers } from './providers';
import Script from 'next/script';
import '@/index.css';

const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || 'Trainco AI';

export const metadata: Metadata = {
  title: agentName,
  description: `Talk to ${agentName} - Career AI Assistant`,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        
        {/* Mobeus Widget Script - New Platform */}
        <Script
          src={`${process.env.NEXT_PUBLIC_WIDGET_HOST || 'https://app.mobeus.ai'}/widget.js`}
          strategy="afterInteractive"
          data-api-key={process.env.NEXT_PUBLIC_WIDGET_API_KEY}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
