import { teleState, type TeleConnectionState, type TeleActiveMode } from "@/lib/teleState";
import { resolveUIModeFromTeleMode, setUIMode } from "@/lib/designSystem";
import { getVisitorSession } from "@/utils/visitorMemory";
import { speakAvatar, teleAcknowledge } from "@/utils/teleUtils";

/** Write state to the singleton and dispatch the connection event. */
export function syncTeleState(
  connectionState: TeleConnectionState,
  activeMode: TeleActiveMode,
  connected: boolean
) {
  if (
    teleState.connectionState === connectionState &&
    teleState.activeMode === activeMode &&
    teleState.connected === connected
  ) return;

  teleState.connectionState = connectionState;
  teleState.activeMode = activeMode;
  teleState.connected = connected;
  setUIMode(resolveUIModeFromTeleMode(activeMode));
  window.dispatchEvent(
    new CustomEvent("tele-connection-changed", { detail: { connected } })
  );
  window.dispatchEvent(
    new CustomEvent("tele-mode-changed", { detail: { activeMode } })
  );
}

export async function disconnectTele() {
  const fw = (window as any).UIFramework;
  if (!fw) return;
  try {
    if (typeof fw.disconnectOpenAI === "function") await fw.disconnectOpenAI();
    if (typeof fw.disconnectAvatar === "function") await fw.disconnectAvatar();
  } catch (e) {
    console.warn("[teleConnect] Disconnect error (non-fatal):", e);
  }
}

export async function connectTele(
  greetingPrompt?: string,
  onAvatarReady?: () => void
) {
  // 1. Wait up to 5 s for CDN script to load
  let attempts = 0;
  while (!(window as any).UIFramework && attempts < 50) {
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }

  const fw = (window as any).UIFramework;
  if (!fw) {
    console.warn("[teleConnect] UIFramework not available after 5s");
    return;
  }

  // 2. Start connection (avatar stream + voice AI)
  if (typeof fw.connectAll === "function") {
    await fw.connectAll();
  } else if (typeof fw.connectOpenAI === "function") {
    await fw.connectOpenAI();
  } else if (typeof fw.connect === "function") {
    await fw.connect();
  }

  const pollMs = 400;
  const pollMax = 30;
  const avatarConnected = () =>
    fw.instance?.avatarController?.isConnected?.() === true;
  const voiceConnected = () =>
    fw.getVoiceChatState?.()?.connectionState?.isConnected === true;

  // 3. Wait for LiveKit / LiveAvatar avatar, then welcome line (needs video path up).
  for (let i = 0; i < pollMax; i++) {
    if (avatarConnected()) break;
    await new Promise((r) => setTimeout(r, pollMs));
  }

  // 4. Hide static avatar (Magic.png) before live avatar speaks.
  onAvatarReady?.();

  const session = getVisitorSession();
  const welcomeText = session
    ? "Welcome back!"
    : "Welcome to train, I am your AI career companion";

  if (welcomeText && avatarConnected()) {
    await speakAvatar(welcomeText, { ensureConnected: true });
  } else if (!welcomeText) {
    // Returning visitor — skip bridge greeting; the AI will handle the full welcome.
  } else {
    console.warn(
      "[teleConnect] Avatar not connected after wait; skipping speakAvatar welcome"
    );
  }

  // 5. Wait for OpenAI voice; teleAcknowledge must run only after both are live.
  for (let i = 0; i < pollMax; i++) {
    if (voiceConnected()) break;
    await new Promise((r) => setTimeout(r, pollMs));
  }

  if (!voiceConnected()) {
    console.warn(
      "[teleConnect] Voice not connected after wait; teleAcknowledge may be unreliable"
    );
  }

  // 6. Brief delay so the Realtime session (prompt + tools) is ready after voice reports connected.
  await new Promise((r) => setTimeout(r, 1200));
  if (!fw.teleAcknowledge) {
    console.warn("[teleConnect] teleAcknowledge not available");
    return;
  }
  const ENGLISH_GATE = "[SYSTEM] Respond ONLY in English. Never switch language. ";
  const prompt = session
    ? ENGLISH_GATE +
      `Returning visitor detected. candidate_id: ${session.candidateId}. ` +
      "Candidate data has been pre-loaded by the frontend. " +
      'Say "Here\'s your profile." and call navigateToSection immediately with EXACTLY this JSON: ' +
      '{"badge":"trAIn CAREER","title":"Dashboard","subtitle":"Your Profile",' +
      '"generativeSubsections":[{"id":"dashboard","templateId":"Dashboard","props":{}},' +
      '{"id":"profile-home","templateId":"ProfileSheet","props":{"dashboardAnchor":true}}]}. ' +
      "Do NOT call fetchCandidate, fetchJobs, or fetchSkills now — they are deferred. " +
      "Skip qualification and registration."
    : ENGLISH_GATE +
      (greetingPrompt ??
        'Say "Are you ready to start your journey?" and call navigateToSection once with EXACTLY this JSON so the bubbles appear: ' +
        '{"badge":"MOBEUS CAREER","title":"Welcome","subtitle":"Getting started",' +
        '"generativeSubsections":[{"id":"start","templateId":"GlassmorphicOptions","props":{"bubbles":[' +
        '{"label":"Yes, I\'m ready"},{"label":"Not just yet"},{"label":"Tell me more"}]}}]}. ' +
        "HARD STOP after that navigateToSection: your turn is DONE. " +
        "Do NOT generate any more speech, audio, or tool calls. " +
        "Do NOT ask the industry question or mention any future step. " +
        "Wait ONLY for `user selected:` from TellTele."
      );
  teleAcknowledge(prompt);
}

export async function connectVoiceOnly(): Promise<boolean> {
  const fw = (window as any).UIFramework;
  if (!fw) return false;
  try {
    if (typeof fw.connectOpenAI === "function") {
      await fw.connectOpenAI();
      return true;
    }
    if (typeof fw.startVoiceChat === "function") {
      await fw.startVoiceChat();
      return true;
    }
  } catch (e) {
    console.warn("[teleConnect] connectVoiceOnly error:", e);
  }
  return false;
}
