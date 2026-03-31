import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePhaseFlow } from "@/hooks/usePhaseFlow";
import { DynamicSectionLoader } from "@/components/DynamicSectionLoader";
import { BaseLayout } from "@/components/BaseLayout";
import { CurrentSectionProvider } from "@/contexts/CurrentSectionContext";
import { ChatHistoryProvider } from "@/contexts/ChatHistoryContext";
import { EntryPoint } from "@/components/EntryPoint";
import { ConnectingScreen } from "@/components/ConnectingScreen";
import { connectTele, syncTeleState } from "@/lib/teleConnect";
import { teleState } from "@/lib/teleState";

type Journey = "landing" | "connecting" | "talent";

/**
 * Wraps the existing talent (job-seeker) AI journey.
 * Kept as a separate component so hooks are called unconditionally.
 */
function TalentApp() {
  const { generativeSubsections } = usePhaseFlow();

  const lastSection = generativeSubsections[generativeSubsections.length - 1];
  const currentTemplateId = lastSection?.templateId;
  const currentSectionId = lastSection?.id;

  return (
    <ChatHistoryProvider sections={generativeSubsections}>
      <CurrentSectionProvider
        currentTemplateId={currentTemplateId}
        currentSectionId={currentSectionId}
      >
        <BaseLayout sections={generativeSubsections}>
          <DynamicSectionLoader sections={generativeSubsections} />
        </BaseLayout>
      </CurrentSectionProvider>
    </ChatHistoryProvider>
  );
}

export default function App() {
  const [journey, setJourney] = useState<Journey>("landing");
  // Independent of journey — stays alive over TalentApp until video stream is ready
  const [showConnecting, setShowConnecting] = useState(false);

  // Return to landing when BottomNav disconnects
  useEffect(() => {
    const handleConnectionChange = () => {
      if (!teleState.connected && journey === "talent") {
        syncTeleState("idle", "none", false);
        setJourney("landing");
      }
    };

    window.addEventListener("tele-connection-changed", handleConnectionChange);
    return () =>
      window.removeEventListener("tele-connection-changed", handleConnectionChange);
  }, [journey]);

  const handleBegin = async () => {
    setShowConnecting(true);
    setJourney("connecting");
    syncTeleState("connecting", "tele", false);
    try {
      await connectTele(undefined, () => {
        syncTeleState("connected", "tele", true);
        // Mount TalentApp under the overlay immediately
        setJourney("talent");
        // Give the live video stream ~1.2s to paint its first frame, then fade out
        setTimeout(() => setShowConnecting(false), 100);
      });
    } catch {
      syncTeleState("idle", "none", false);
      setJourney("landing");
      setShowConnecting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {journey === "landing" && (
          <EntryPoint key="landing" onBegin={handleBegin} />
        )}
        {journey === "talent" && (
          <motion.div
            key="talent"
            className="w-screen h-[100svh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <TalentApp />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connecting overlay — fixed on top, outlives the "connecting" journey state
          so TalentApp can mount and the video stream can warm up before reveal */}
      <AnimatePresence>
        {showConnecting && <ConnectingScreen key="connecting-overlay" />}
      </AnimatePresence>
    </>
  );
}
