import React from 'react';
import { MapPin } from 'lucide-react';

const C = 'var(--theme-chart-line)';
const getColor = (opacity: number) => `color-mix(in srgb, var(--theme-chart-line) ${opacity}%, transparent)`;

interface JobCardProps {
    title: string;
    company: string;
    companyLogo?: string;
    salary?: string;
    location?: string;
    matchScore?: number;
    fitCategory?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
    title,
    company,
    companyLogo,
    salary,
    location,
    matchScore,
    fitCategory,
}) => (
    <div className="flex flex-col h-full gap-3 justify-between">
        {/* Header with company and title */}
        <div className="flex gap-3 items-start">
            <div className="size-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center bg-white/10 border border-white/15">
                {companyLogo ? (
                    <img src={companyLogo} alt={company} className="w-full h-full object-contain" />
                ) : (
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                        {company.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-data text-lg font-bold truncate" style={{ color: getColor(95) }}>
                    {title}
                </h3>
                <p className="font-voice text-sm truncate" style={{ color: getColor(70) }}>
                    {company}
                </p>
            </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2">
            {salary && (
                <div className="flex gap-2 items-center">
                    <span className="font-data text-base" style={{ color: getColor(80) }}>
                        💰 {salary}
                    </span>
                </div>
            )}
            {location && (
                <div className="flex gap-2 items-center">
                    <MapPin size={16} style={{ color: getColor(70) }} />
                    <span className="font-voice text-sm" style={{ color: getColor(70) }}>
                        {location}
                    </span>
                </div>
            )}
        </div>

        {/* Footer with match score and fit */}
        {(matchScore != null || fitCategory) && (
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: getColor(10) }}>
                {matchScore != null && (
                    <div className="flex items-center gap-2">
                        <span className="font-voice text-xs" style={{ color: getColor(60) }}>
                            Match
                        </span>
                        <span className="font-data text-xl font-bold" style={{ color: C }}>
                            {matchScore}%
                        </span>
                    </div>
                )}
                {fitCategory && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                        backgroundColor: getColor(15),
                        color: C
                    }}>
                        {fitCategory}
                    </span>
                )}
            </div>
        )}
    </div>
);

export default JobCard;
