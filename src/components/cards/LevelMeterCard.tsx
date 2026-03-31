import React from 'react';
import { LevelMeter } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface LevelMeterCardProps {
    label: string;
    current: number;
    target: number;
    variant?: 'green' | 'blue';
    subtitle?: string;
}

export const LevelMeterCard: React.FC<LevelMeterCardProps> = ({
    label,
    current,
    target,
    variant = 'blue',
    subtitle,
}) => (
    <div className="flex flex-col h-full justify-center gap-3">
        <h3 className="font-data text-base uppercase tracking-wider" style={{ color: getColor(90) }}>
            {label}
        </h3>
        <LevelMeter current={current} target={target} variant={variant} />
        {subtitle && (
            <p className="font-voice text-sm" style={{ color: getColor(70) }}>
                {subtitle}
            </p>
        )}
    </div>
);

export default LevelMeterCard;
