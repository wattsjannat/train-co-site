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
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            window.__siteFunctions = {};
            window.__siteFunctions.navigateToSection = function(args) {
              console.log('[navigateToSection bridge v3] Called with:', args);
              var badge = args.badge;
              var title = args.title;
              var subtitle = args.subtitle;
              var generativeSubsections = args.generativeSubsections;
              var sdkNav = window.UIFrameworkSiteFunctions && window.UIFrameworkSiteFunctions.navigateToSection;
              
              if (typeof sdkNav === 'function') {
                console.log('[navigateToSection bridge v3] Calling SDK');
                return sdkNav(badge, title, subtitle, generativeSubsections);
              } else {
                console.warn('[navigateToSection bridge v3] SDK not ready, queueing');
                setTimeout(function() {
                  var nav = window.UIFrameworkSiteFunctions && window.UIFrameworkSiteFunctions.navigateToSection;
                  if (typeof nav === 'function') {
                    nav(badge, title, subtitle, generativeSubsections);
                  }
                }, 1000);
                return { success: true, queued: true };
              }
            };
            console.log('[Site Functions v3] navigateToSection bridge registered');
          })();
        `}} />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        
        {/* Mobeus 2.0 SDK Pre-Configuration */}
        <Script
          id="mobeus-preconfig"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            // Mobeus 2.0 Configuration
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
            
            // Global API key configuration for Mobeus 2.0
            window.MOBEUS_WIDGET_API_KEY = "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}";
            window.AGENT_API_KEY = "${process.env.NEXT_PUBLIC_WIDGET_API_KEY || ''}";
            
            // Force avatar/voice IDs globally
            window.MOBEUS_AVATAR_ID = '92329d89e4434e63b6260f9f374fffb0';
            window.MOBEUS_VOICE_ID = '8a4dfef7aacf4ad88c10ae9391bd3098';
            
            console.log('[Mobeus 2.0] Pre-init config with API key and avatar/voice IDs');
          `}}
        />
        
        {/* Mobeus 2.0 SDK (Tele Live Avatar) */}
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
