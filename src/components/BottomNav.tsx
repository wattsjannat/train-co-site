import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { teleState } from "@/lib/teleState";
import type { TeleConnectionState, TeleActiveMode } from "@/lib/teleState";
import { syncTeleState, disconnectTele } from "@/lib/teleConnect";

interface BottomNavProps {
  className?: string;
}

/* ── Inline SVGs matching Figma icons ──────────────────────────────────── */

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1.5 L13.6 6.8 L19 8 L13.6 9.2 L12 14.5 L10.4 9.2 L5 8 L10.4 6.8 Z" />
    <path d="M5 15 L5.9 17.6 L8.5 18.5 L5.9 19.4 L5 22 L4.1 19.4 L1.5 18.5 L4.1 17.6 Z" opacity="0.7" />
    <path d="M19 12.5 L19.7 14.6 L21.8 15.3 L19.7 16 L19 18.1 L18.3 16 L16.2 15.3 L18.3 14.6 Z" opacity="0.5" />
  </svg>
);

const SoundwaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2"  y="9"  width="2.5" height="6"  rx="1.25" opacity="0.45" />
    <rect x="6"  y="6"  width="2.5" height="12" rx="1.25" opacity="0.65" />
    <rect x="10" y="3"  width="2.5" height="18" rx="1.25" />
    <rect x="14" y="6"  width="2.5" height="12" rx="1.25" opacity="0.65" />
    <rect x="18" y="9"  width="2.5" height="6"  rx="1.25" opacity="0.45" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4C2.9 2 2 2.9 2 4V18L6 14H20C21.1 14 22 13.1 22 12V4C22 2.9 21.1 2 20 2Z" opacity="0.8" />
  </svg>
);

/** Layout from Figma Design System — Bottom Nav (6958:15887); 168×40, px-4 py-2, 56px active capsule */
const ACTIVE_CAPSULE_W = 56;
const ACTIVE_CAPSULE_LEFT: Record<"tele" | "voice" | "chat", number> = {
  tele: 0,
  voice: 55,
  chat: 112,
};

export function BottomNav({ className = "" }: BottomNavProps) {
  // Read initial state from singleton so remounts (phase changes) preserve state.
  const [connectionState, setConnectionState] = useState<TeleConnectionState>(
    () => teleState.connectionState
  );
  const [activeMode, setActiveModeState] = useState<TeleActiveMode>(
    () => teleState.activeMode
  );

  /** Update both local state and the module singleton, then dispatch event. */
  const applyState = (
    cs: TeleConnectionState,
    am: TeleActiveMode,
    connected: boolean
  ) => {
    setConnectionState(cs);
    setActiveModeState(am);
    syncTeleState(cs, am, connected);
  };

  // Tele button: disconnect if active, switch to tele mode if another mode is active
  const handleTeleButton = async () => {
    if (connectionState !== "connected") return;

    if (activeMode === "tele") {
      await disconnectTele();
      applyState("idle", "none", false);
    } else {
      applyState("connected", "tele", true);
    }
  };

  // Voice button: disconnect if active, switch to voice mode if another mode is active
  const handleVoiceButton = async () => {
    if (connectionState !== "connected") return;

    if (activeMode === "voice") {
      await disconnectTele();
      applyState("idle", "none", false);
    } else {
      applyState("connected", "voice", true);
    }
  };

  // Chat button: disconnect if active, switch to chat mode if another mode is active
  const handleChatButton = async () => {
    if (connectionState !== "connected") return;

    if (activeMode === "chat") {
      await disconnectTele();
      applyState("idle", "none", false);
    } else {
      applyState("connected", "chat", true);
    }
  };

  const connected = connectionState === "connected";
  const teleActive = activeMode === "tele" && connected;
  const voiceActive = activeMode === "voice" && connected;
  const chatActive = activeMode === "chat" && connected;
  const inactiveIcon = "text-[var(--text-bottom-nav-icon-muted)]";

  const showActiveCapsule =
    connected && (activeMode === "tele" || activeMode === "voice" || activeMode === "chat");
  const activeCapsuleLeft =
    activeMode === "tele" || activeMode === "voice" || activeMode === "chat"
      ? ACTIVE_CAPSULE_LEFT[activeMode]
      : 0;

  return (
    <div data-testid="bottom-nav" className={cn("relative h-10 w-[168px]", className)}>

      {/* Base pill — Figma: surface #18181b, border #27272a, soft white outer glow */}
      <div
        data-testid="bottom-nav-pill"
        className={cn(
          "absolute inset-0 flex items-center justify-between rounded-[100px] px-4 py-2",
          "no-lightboard bg-[var(--accent-contrast)] border border-[var(--border-card)] [box-shadow:var(--shadow-bottom-nav-pill)]",
        )}
      >
        {/* Button 1: Tele (avatar + voice) */}
        <button
          data-testid="bottom-nav-tele-btn"
          onClick={handleTeleButton}
          className={cn(
            "relative z-[1] flex size-6 items-center justify-center transition-colors",
            teleActive ? "text-[var(--accent-strong)]" : inactiveIcon,
          )}
          aria-label={teleActive ? "Disconnect Tele" : "Switch to Tele"}
        >
          {teleActive ? (
            <X size={18} className="text-[var(--accent-strong)]" />
          ) : (
            <SparklesIcon />
          )}
        </button>

        {/* Button 2: Voice only */}
        <button
          data-testid="bottom-nav-voice-btn"
          onClick={handleVoiceButton}
          className={cn(
            "absolute z-[1] flex size-6 items-center justify-center transition-colors",
            voiceActive ? "text-[var(--accent-strong)]" : inactiveIcon,
          )}
          style={{ left: 71, top: 7 }}
          aria-label={voiceActive ? "Disconnect voice" : "Voice only"}
        >
          <SoundwaveIcon />
        </button>

        {/* Button 3: Chat */}
        <button
          data-testid="bottom-nav-chat-btn"
          onClick={handleChatButton}
          className={cn(
            "relative z-[1] flex size-6 items-center justify-center transition-colors",
            chatActive ? "text-[var(--accent-strong)]" : inactiveIcon,
          )}
          aria-label={chatActive ? "Disconnect chat" : "Chat"}
        >
          <ChatIcon />
        </button>
      </div>

      {/* Active capsule — Figma SelectedToggleItem: #1c1c1e fill, #1ed25e border + green glow */}
      {showActiveCapsule && (
        <div
          data-testid="bottom-nav-connected-glow"
          className={cn(
            "pointer-events-none absolute top-0 z-[2] flex h-full items-center justify-center rounded-[100px] py-2",
            "border border-[var(--accent-strong)] bg-[var(--surface-bottom-nav-capsule)]",
            "shadow-[0px_0px_8px_0px_var(--accent-strong)]",
            "transition-[left] duration-200 ease-out",
          )}
          style={{ left: activeCapsuleLeft, width: ACTIVE_CAPSULE_W }}
        >
          {activeMode === "tele" && <X size={18} className="text-[var(--accent-strong)]" />}
          {activeMode === "voice" && (
            <SoundwaveIcon className="size-6 text-[var(--accent-strong)]" />
          )}
          {activeMode === "chat" && <ChatIcon className="size-6 text-[var(--accent-strong)]" />}
        </div>
      )}
    </div>
  );
}
