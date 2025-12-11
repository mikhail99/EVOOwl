import React from 'react';
import { motion } from 'framer-motion';

export default function FitnessRing({ score, maxScore = 100, size = 80, strokeWidth = 6 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / maxScore) * circumference;
    const center = size / 2;

    const getColor = () => {
        const ratio = score / maxScore;
        if (ratio >= 0.8) return { from: '#10b981', to: '#34d399' }; // emerald
        if (ratio >= 0.6) return { from: '#8b5cf6', to: '#a78bfa' }; // violet
        if (ratio >= 0.4) return { from: '#f59e0b', to: '#fbbf24' }; // amber
        return { from: '#ef4444', to: '#f87171' }; // red
    };

    const colors = getColor();

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={`url(#gradient-${score})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - progress }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={colors.from} />
                        <stop offset="100%" stopColor={colors.to} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    className="text-lg font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {score}
                </motion.span>
            </div>
        </div>
    );
}