import React from 'react';
import { CircularGauge } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface CircularGaugeCardProps {
    label: string;
    percentage?: number;
    size?: number;
    accent?: 'green' | 'amber' | 'red';
    subtitle?: string;
}

export const CircularGaugeCard: React.FC<CircularGaugeCardProps> = ({
    label,
    percentage,
    size = 98,
    accent,
    subtitle,
}) => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
        <h3 className="font-data text-base uppercase tracking-wider" style={{ color: getColor(80) }}>
            {label}
        </h3>
        <CircularGauge percentage={percentage} size={size} accent={accent} />
        {subtitle && (
            <p className="font-voice text-sm text-center" style={{ color: getColor(70) }}>
                {subtitle}
            </p>
        )}
    </div>
);

export default CircularGaugeCard;
