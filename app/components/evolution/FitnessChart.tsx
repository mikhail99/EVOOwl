import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl p-3 shadow-xl">
                <p className="text-xs text-slate-400 mb-2">Generation {label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-slate-300">{entry.name}:</span>
                        <span className="text-xs font-semibold text-white">
                            {entry.value?.toFixed(1)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function FitnessChart({ data = [] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Fitness Evolution</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
                        <span className="text-xs text-slate-400">Best</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-400" />
                        <span className="text-xs text-slate-400">Average</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="85%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="bestGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="generation"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#334155' }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="avgFitness"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fill="url(#avgGradient)"
                        name="Average"
                        animationDuration={500}
                    />
                    <Area
                        type="monotone"
                        dataKey="bestFitness"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#bestGradient)"
                        name="Best"
                        animationDuration={500}
                    />
                    <Line
                        type="monotone"
                        dataKey="bestFitness"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#1e1b4b' }}
                        activeDot={{ r: 6, fill: '#a78bfa', stroke: '#8b5cf6', strokeWidth: 2 }}
                        name="Best"
                        animationDuration={500}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </motion.div>
    );
}