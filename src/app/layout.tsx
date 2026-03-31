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
        
        {/* Mock API Interceptor for Static Export */}
        <Script
          id="mock-api-interceptor"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            (function() {
              if (typeof window === 'undefined') return;
              const originalFetch = window.fetch;
              window.fetch = async function(input, init) {
                const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
                if (url.includes('/api/invoke/')) {
                  const toolName = url.split('/api/invoke/')[1].split('?')[0];
                  await new Promise(resolve => setTimeout(resolve, 100));
                  return new Response(JSON.stringify({ success: true, data: {} }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                  });
                }
                return originalFetch(input, init);
              };
            })();
          `}}
        />
        
        {/* UIFramework Configuration */}
        <Script
          id="uiframework-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            window.UIFRAMEWORK_AUTO_INIT = true;
            window.UIFrameworkPreInitConfig = {
              explicitTenantUuid: "4e93127e-0dcc-432b-8c27-ed32f064d59e",
              autoConnect: false,
              autoConnectAvatar: false,
              autoConnectVoice: false,
              waitForAvatarBeforeVoice: true,
              voiceUIVisible: false,
              muteByDefault: false,
              enableVoiceChat: true,
              enableAvatar: true,
              lightboard: {
                enabled: false,
              },
            };
          `}}
        />
        
        {/* UIFramework Site Functions Bridge */}
        <Script
          id="uiframework-bridge"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            (function registerUIFrameworkSiteFunctions() {
              const navigationBridge = {
                navigateToSection(data) {
                  console.warn("[UIFramework] navigateToSection called before React initialized:", data);
                  return false;
                },
              };

              const volumeBridge = {
                setVolume(level) {
                  if (typeof level !== "number") return undefined;
                  if (typeof window !== "undefined" && window.teleVolume && typeof window.teleVolume.setVolume === "function") {
                    window.teleVolume.setVolume(level);
                    return true;
                  }
                  return undefined;
                },
              };

              const mcpBridge = {
                fetchJobs() { console.warn("[mcpBridge] fetchJobs called before React initialized"); return undefined; },
                fetchSkills() { console.warn("[mcpBridge] fetchSkills called before React initialized"); return undefined; },
                fetchCandidate() { console.warn("[mcpBridge] fetchCandidate called before React initialized"); return undefined; },
                fetchCareerGrowth() { console.warn("[mcpBridge] fetchCareerGrowth called before React initialized"); return undefined; },
                fetchMarketRelevance() { console.warn("[mcpBridge] fetchMarketRelevance called before React initialized"); return undefined; },
                cacheJobApplicants() { console.warn("[employerApplicantsCache] cacheJobApplicants called before React initialized"); return false; },
              };

              const existingRegistry =
                typeof window !== "undefined" && window.UIFrameworkSiteFunctions && typeof window.UIFrameworkSiteFunctions === "object"
                  ? window.UIFrameworkSiteFunctions
                  : {};

              window.UIFrameworkSiteFunctions = {
                ...existingRegistry,
                ...navigationBridge,
                ...volumeBridge,
                ...mcpBridge,
              };

              try {
                window.dispatchEvent(new CustomEvent("UIFrameworkSiteFunctionsReady", {
                  detail: { registry: window.UIFrameworkSiteFunctions },
                }));
              } catch (e) {}
            })();
          `}}
        />
        
        {/* Employer Mode - Intercept getUserMedia */}
        <Script
          id="employer-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{__html: `
            (function () {
              window.__employerMode = false;
              var _origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
              navigator.mediaDevices.getUserMedia = function (constraints) {
                if (window.__employerMode && constraints && constraints.audio) {
                  try {
                    var ctx = new AudioContext();
                    var dest = ctx.createMediaStreamDestination();
                    return Promise.resolve(dest.stream);
                  } catch (e) {
                    return Promise.resolve(new MediaStream());
                  }
                }
                return _origGUM(constraints);
              };
            })();
          `}}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        
        {/* UIFramework LiveAvatar SDK */}
        <Script
          src="https://telecdn.s3.us-east-2.amazonaws.com/js/ui-framework-liveavatar.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
