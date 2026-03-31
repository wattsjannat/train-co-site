import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TeleSpeechProvider } from "@/contexts/TeleSpeechContext";
import { McpCacheProvider } from "@/contexts/McpCacheContext";
import { setUIMode } from "@/lib/designSystem";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

// TeleSpeechProvider is placed here (above App/BaseLayout) so it is mounted
// exactly once and never re-mounts during template transitions. This gives all
// useTeleSpeech() consumers — TeleSpeechBubble, GlassmorphicOptions, etc. —
// a single shared isTalking state backed by one LiveKit listener. Components
// that mount mid-speech (e.g. GlassmorphicOptions rendered by navigateToSection
// while the avatar is talking) therefore correctly read isTalking=true instead
// of starting fresh with isTalking=false and triggering the silence timer early.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <McpCacheProvider>
        <TeleSpeechProvider>
          <App />
        </TeleSpeechProvider>
      </McpCacheProvider>
    </QueryClientProvider>
  </StrictMode>
);

// Default mode is video for the current product experience.
setUIMode("video");
