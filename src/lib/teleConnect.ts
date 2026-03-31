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
  // 1. Wait up to 5s for UIFramework to load
  let attempts = 0;
  while (!(window as any).UIFramework && attempts < 50) {
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }

  const fw = (window as any).UIFramework;
  if (!fw) {
    console.error("[teleConnect] UIFramework not available after 5s. Check CDN connection.");
    return;
  }
  
  console.log("[teleConnect] UIFramework loaded");
  
  // Set agent API key for configuration loading
  const apiKey = (window as any).MOBEUS_WIDGET_API_KEY || (window as any).UIFrameworkPreInitConfig?.apiKey;
  if (apiKey) {
    console.log("[teleConnect] Setting agent API key:", apiKey.substring(0, 15) + '...');
    
    // Try multiple methods to set the API key
    if (fw.setWidgetApiKey && typeof fw.setWidgetApiKey === 'function') {
      fw.setWidgetApiKey(apiKey);
      console.log("[teleConnect] API key set via setWidgetApiKey");
    }
    if (fw.setAgentApiKey && typeof fw.setAgentApiKey === 'function') {
      fw.setAgentApiKey(apiKey);
      console.log("[teleConnect] API key set via setAgentApiKey");
    }
    if (fw.setApiKey && typeof fw.setApiKey === 'function') {
      fw.setApiKey(apiKey);
      console.log("[teleConnect] API key set via setApiKey");
    }
    
    // Try to load agent configuration
    if (fw.loadAgentConfig && typeof fw.loadAgentConfig === 'function') {
      await fw.loadAgentConfig(apiKey);
      console.log("[teleConnect] Agent config loaded from API");
    } else if (fw.fetchAgentConfig && typeof fw.fetchAgentConfig === 'function') {
      await fw.fetchAgentConfig(apiKey);
      console.log("[teleConnect] Agent config fetched from API");
    }
    
    // Force avatar and voice IDs from agent config
    const avatarID = (window as any).MOBEUS_AVATAR_ID || '92329d89e4434e63b6260f9f374fffb0';
    const voiceID = (window as any).MOBEUS_VOICE_ID || '8a4dfef7aacf4ad88c10ae9391bd3098';
    
    console.log("[teleConnect] Forcing avatar/voice IDs:", { avatarID, voiceID });
    
    // Set IDs directly on avatar model
    const avatarModel = fw.instance?.avatarModel || fw.avatarModel;
    if (avatarModel) {
      avatarModel.avatarID = avatarID;
      avatarModel.voiceID = voiceID;
      console.log("[teleConnect] Avatar/voice IDs set on model");
    }
    
    // Also try setting via controller
    const avatarController = fw.instance?.avatarController || fw.avatarController;
    if (avatarController && avatarController.setAvatarConfig) {
      avatarController.setAvatarConfig({ avatarID, voiceID });
      console.log("[teleConnect] Avatar/voice IDs set via controller");
    }
  } else {
    console.warn("[teleConnect] No API key found");
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
        '{"badge":"TRAIN CO CAREER","title":"Welcome","subtitle":"Getting started",' +
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
