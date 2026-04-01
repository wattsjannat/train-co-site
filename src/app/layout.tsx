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
        
        {/* UIFramework Pre-Configuration with Agent API Key */}
        <Script
          id="uiframework-preconfig"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            window.UIFRAMEWORK_AUTO_INIT = false;
            window.UIFrameworkPreInitConfig = {
              widgetApiKey: "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}",
              agentApiKey: "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}",
              apiKey: "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}",
              autoConnect: false,
              autoConnectAvatar: false,
              autoConnectVoice: false,
              waitForAvatarBeforeVoice: true,
              voiceUIVisible: false,
              muteByDefault: false,
              enableVoiceChat: true,
              enableAvatar: true,
              useAgentConfig: true,
              // Force avatar/voice from agent config (Jaya avatar + Liam voice)
              avatarID: '92329d89e4434e63b6260f9f374fffb0',
              voiceID: '8a4dfef7aacf4ad88c10ae9391bd3098',
              lightboard: {
                enabled: false,
              },
            };
            
            // Also set as global for UIFramework to pick up
            window.MOBEUS_WIDGET_API_KEY = "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}";
            window.AGENT_API_KEY = "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}";
            
            // Force avatar/voice IDs globally
            window.MOBEUS_AVATAR_ID = '92329d89e4434e63b6260f9f374fffb0';
            window.MOBEUS_VOICE_ID = '8a4dfef7aacf4ad88c10ae9391bd3098';
            
            // Initialize site functions object IMMEDIATELY (before SDK loads)
            window.__siteFunctions = {};
            
            console.log('[UIFramework] Pre-init config with API key and forced avatar/voice IDs');
          `}}
        />
        
        {/* Early Site Functions Registration - MUST load before SDK */}
        <Script
          src="/register-site-functions.js"
          strategy="beforeInteractive"
        />
        
        {/* UIFramework SDK - Agent Template System */}
        <Script
          src="https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
