import { useMemo } from "react";
import { X } from "lucide-react";
import { CircularGauge } from "@/components/charts/CircularGauge";
import { LevelMeter } from "@/components/charts/LevelMeter";
import { PathTrack, type PathStop } from "@/components/charts/PathTrack";
import { sendTappedIntent } from "@/utils/teleIntent";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ViewFullDetailsButton } from "@/components/ui/ViewFullDetailsButton";
import { useSpeechFallbackNudge } from "@/hooks/useSpeechFallbackNudge";
import { useVoiceActions } from "@/hooks/useVoiceActions";
import {
  computeProfileMetrics,
  mapRawSkillProgression,
  type SkillProgressionItem,
} from "@/utils/computeProfileMetrics";
import { DEFAULT_STOPS } from "@/constants/careerPathStops";
import { navigateClientToDashboardLanding, navigateClientToSkillTestFlow } from "@/utils/clientDashboardNavigate";

/* ── Constants ────────────────────────────────────────────────────────────── */

const HARDCODED_SKILL_GAPS: SkillProgressionItem[] = [
  {
    name: "Kubernetes",
    current_level: 1,
    target_level: 2,
    is_featured: true,
  },
];

/* ── Types ────────────────────────────────────────────────────────────────── */

interface SkillsDetailProps {
  rawSkillProgression?: Record<string, unknown>;
  skillCoverage?: number;
  targetRole?: string;
}

export function SkillsDetail({
  rawSkillProgression,
  skillCoverage: overrideCoverage,
  targetRole: overrideRole,
}: SkillsDetailProps) {
  const skillData = useMemo(
    () => mapRawSkillProgression(rawSkillProgression),
    [rawSkillProgression],
  );
  const computed = useMemo(() => computeProfileMetrics(skillData), [skillData]);

  const coverage = overrideCoverage ?? computed.skillCoverage ?? 0;
  const targetRole = overrideRole ?? computed.targetRole ?? "AI Engineer";

  const stops: PathStop[] = useMemo(() => {
    const last = DEFAULT_STOPS[DEFAULT_STOPS.length - 1];
    if (targetRole && last.label !== targetRole) {
      return [DEFAULT_STOPS[0], DEFAULT_STOPS[1], { label: targetRole, status: "upcoming" }];
    }
    return DEFAULT_STOPS;
  }, [targetRole]);

  useSpeechFallbackNudge({
    enabled: false,
    requiredPhrases: ["skill", "coverage"],
    matchMode: "any",
    instruction:
      `[SYSTEM] SkillsDetail is now visible. Say: "You are working towards ${targetRole}. You are ${coverage}% of the way there. I recommend working on your Kubernetes skills."`,
    delayMs: 2500,
  });

  useVoiceActions(
    useMemo(() => [
      { phrases: ["close", "go back", "back to profile", "dashboard"], action: () => navigateClientToDashboardLanding() },
      { phrases: ["kubernetes", "start kubernetes", "learning path", "upgrade kubernetes"], action: () => navigateClientToSkillTestFlow() },
    ], []),
  );

  const handleClose = () => navigateClientToDashboardLanding();

  return (
    <>
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 size-10 rounded-full flex items-center justify-center bg-[var(--surface-elevated)] pointer-events-auto"
        aria-label="Close"
      >
        <X size={20} className="text-[var(--text-primary)]" />
      </button>
      <BottomSheet onClose={handleClose}>
        <div
          data-testid="skills-detail"
          className="relative overflow-hidden flex flex-col gap-4 z-20"
        >
          <div className="flex flex-col gap-2">
            {/* Top card: gauge + career path */}
            <div className="rounded-2xl p-4 flex gap-4 items-center glass-surface">
              <CircularGauge percentage={coverage} size={105} />
              <div className="flex-1 min-w-0">
                <PathTrack label="Career Path" percentage={coverage} stops={stops} />
              </div>
            </div>

            {/* We recommend */}
            <div className="rounded-2xl p-4 flex flex-col gap-4 glass-surface">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span className="text-[var(--text-primary)] text-xl font-semibold">
                  We recommend
                </span>
              </div>

              {HARDCODED_SKILL_GAPS.map((skill) => {
                const levelLabels = ["Novice", "Beginner", "Intermediate", "Advanced", "Expert"];
                const currentLabel = levelLabels[skill.current_level] || "Novice";
                const targetLabel = levelLabels[skill.target_level] || "Expert";

                return (
                  <button
                    key={skill.name}
                    onClick={() => navigateClientToSkillTestFlow()}
                    className="flex flex-col gap-2 w-full text-left pointer-events-auto"
                  >
                    <p className="text-[var(--text-primary)] text-base font-bold">
                      {skill.name}
                    </p>

                    <LevelMeter current={skill.current_level} target={skill.target_level} height={8} gap={3} />

                    <span className="text-sm text-[var(--text-primary)]">
                      {skill.current_level === 0 ? "Missing Skill" : `${currentLabel} → ${targetLabel}`}
                    </span>

                    <p className="text-[var(--text-primary)] text-base leading-6">
                      <span className="font-bold">{skill.name}</span>
                      {" "}appears as part of your Target Role and in{" "}
                      <span className="font-bold">3 of your saved jobs</span>.
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <ViewFullDetailsButton
            onClick={() => void sendTappedIntent("View Skill Coverage Details")}
          />
        </div>
      </BottomSheet>
    </>
  );
}
