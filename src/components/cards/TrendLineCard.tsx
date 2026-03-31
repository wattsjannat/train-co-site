import React from 'react';
import { TrendLine } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface TrendPoint {
    month: string;
    score: number;
}

interface TrendLineCardProps {
    title?: string;
    data: TrendPoint[];
    showLabels?: boolean;
}

export const TrendLineCard: React.FC<TrendLineCardProps> = ({
    title,
    data,
    showLabels = false,
}) => (
    <div className="flex flex-col h-full justify-center gap-3">
        {title && (
            <h3 className="font-data text-base uppercase tracking-wider" style={{ color: getColor(90) }}>
                {title}
            </h3>
        )}
        <TrendLine data={data} showLabels={showLabels} />
    </div>
);

export default TrendLineCard;
