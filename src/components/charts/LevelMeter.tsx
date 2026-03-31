import type React from "react";

interface LevelMeterProps {
  current: number;
  target: number;
  variant?: "green" | "blue";
  height?: number;
  gap?: number;
  segments?: number;
}

export function LevelMeter({
  current,
  target,
  variant = "blue",
  height = 6,
  gap = 2,
  segments = 5,
}: LevelMeterProps) {
  const filledColor = variant === "green" ? "var(--accent)" : "var(--funnel-bar-blue)";
  const targetColor = "var(--funnel-bar-blue-muted)";
  const inactiveColor = variant === "green" ? "var(--bar-inactive)" : "var(--bar-track-light, var(--bar-inactive))";

  return (
    <div
      className="relative flex w-full no-lightboard"
      style={{ isolation: "isolate", gap }}
    >
      {Array.from({ length: segments }, (_, i) => {
        const isFilled = i < current;
        const isTarget = !isFilled && i < target;
        return (
          <div
            key={i}
            className="flex-1 rounded-full no-lightboard bar-color"
            style={{
              height,
              willChange: "transform",
              "--_bar": isFilled ? filledColor : isTarget ? targetColor : inactiveColor,
              ...(isTarget && variant === "blue"
                ? { boxShadow: "inset 0 0 0 1px var(--funnel-bar-blue)" }
                : {}),
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

export default LevelMeter;
