import React from 'react';
import { DotPlot } from '@/components/charts';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface SkillItem {
    label: string;
    filled: number;
    target?: number;
    value?: number | string;
}

interface SkillProgressCardProps {
    title?: string;
    skills: SkillItem[];
}

export const SkillProgressCard: React.FC<SkillProgressCardProps> = ({ title, skills = [] }) => (
    <div className="flex flex-col h-full gap-3">
        {title && (
            <h3 className="font-data text-base uppercase tracking-wider" style={{ color: getColor(90) }}>
                {title}
            </h3>
        )}
        <div className="flex flex-col gap-3 flex-1">
            {skills.map((skill, i) => (
                <DotPlot
                    key={i}
                    label={skill.label}
                    filled={skill.filled}
                    target={skill.target}
                    value={skill.value}
                />
            ))}
        </div>
    </div>
);

export default SkillProgressCard;
