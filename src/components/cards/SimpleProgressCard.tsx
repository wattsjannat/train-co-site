import React from 'react';
import { ProgressBar } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface SimpleProgressCardProps {
    label: string;
    percent: number;
    color?: string;
    subtitle?: string;
}

export const SimpleProgressCard: React.FC<SimpleProgressCardProps> = ({
    label,
    percent,
    color = 'var(--theme-chart-line)',
    subtitle,
}) => (
    <div className="flex flex-col h-full justify-center gap-3">
        <div className="flex justify-between items-center">
            <h3 className="font-data text-base uppercase tracking-wider" style={{ color: getColor(90) }}>
                {label}
            </h3>
            <span className="font-data text-xl font-bold" style={{ color: C }}>
                {percent}%
            </span>
        </div>
        <ProgressBar percent={percent} color={color} />
        {subtitle && (
            <p className="font-voice text-sm" style={{ color: getColor(70) }}>
                {subtitle}
            </p>
        )}
    </div>
);

export default SimpleProgressCard;
