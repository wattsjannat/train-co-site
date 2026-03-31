interface ProgressBarProps {
  percent: number;
  color: string;
  heightClass?: string;
  radiusClass?: string;
}

export function ProgressBar({
  percent,
  color,
  heightClass = "h-3",
  radiusClass = "rounded-full",
}: ProgressBarProps) {
  return (
    <div className={`${heightClass} ${radiusClass} bg-[var(--bar-track)] overflow-hidden`}>
      <div
        className={`h-full ${radiusClass} no-lightboard bar-color transition-all duration-500`}
        style={{ width: `${percent}%`, "--_bar": color } as React.CSSProperties}
      />
    </div>
  );
}

export default ProgressBar;
