import React from 'react';
import { PathTrack, PathStop } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface PathTrackCardProps {
    label?: string;
    fromLabel?: string;
    toLabel?: string;
    percentage: number;
    stops?: PathStop[];
}

export const PathTrackCard: React.FC<PathTrackCardProps> = ({
    label,
    fromLabel,
    toLabel,
    percentage,
    stops,
}) => (
    <div className="flex flex-col h-full justify-center px-2">
        <PathTrack
            label={label}
            fromLabel={fromLabel}
            toLabel={toLabel}
            percentage={percentage}
            stops={stops}
        />
    </div>
);

export default PathTrackCard;
