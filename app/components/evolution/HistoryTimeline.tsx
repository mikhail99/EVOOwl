import React from 'react';
import { motion } from 'framer-motion';
import {
    Bookmark,
    Trophy,
    Flag,
    Circle,
    CheckCircle2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Snapshot } from '@/api/types';

const snapshotIcons: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
    manual: { icon: Bookmark, color: 'text-blue-400', bg: 'bg-blue-500' },
    new_champion: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500' },
    generation_complete: { icon: Circle, color: 'text-violet-400', bg: 'bg-violet-500' },
    evolution_complete: { icon: Flag, color: 'text-emerald-400', bg: 'bg-emerald-500' }
};

type HistoryTimelineProps = {
    snapshots?: Snapshot[];
    currentSnapshotId: string | null;
    onSelectSnapshot: (snapshot: Snapshot) => void;
};

export default function HistoryTimeline({
    snapshots = [],
    currentSnapshotId,
    onSelectSnapshot
}: HistoryTimelineProps) {
    if (snapshots.length === 0) {
        return (
            <div className="text-center py-8">
                <Circle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No history yet</p>
            </div>
        );
    }

    const maxFitness = Math.max(...snapshots.map(s => s.best_fitness || 0), 1);

    return (
        <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-700 -translate-y-1/2" />

            <TooltipProvider>
                <div className="relative flex justify-between items-end gap-2 pb-8">
                    {snapshots.map((snapshot, index) => {
                        const config = snapshotIcons[snapshot.snapshot_type] || snapshotIcons.generation_complete;
                        const Icon = config.icon;
                        const isActive = snapshot.id === currentSnapshotId;
                        const fitnessHeight = (snapshot.best_fitness / maxFitness) * 60 + 20;

                        return (
                            <Tooltip key={snapshot.id}>
                                <TooltipTrigger asChild>
                                    <motion.button
                                        onClick={() => onSelectSnapshot(snapshot)}
                                        className="relative flex flex-col items-center gap-2 group"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Fitness bar */}
                                        <motion.div
                                            className={`w-2 rounded-full ${config.bg} opacity-30`}
                                            initial={{ height: 0 }}
                                            animate={{ height: fitnessHeight }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                        />

                                        {/* Node */}
                                        <motion.div
                                            className={`relative w-5 h-5 rounded-full border-2 ${isActive
                                                    ? `${config.bg} ${config.bg.replace('bg-', 'border-')} shadow-lg`
                                                    : `bg-slate-800 ${config.bg.replace('bg-', 'border-')}/50`
                                                } transition-all duration-200 group-hover:scale-110`}
                                            animate={isActive ? {
                                                boxShadow: [
                                                    '0 0 0 0px rgba(139, 92, 246, 0.4)',
                                                    '0 0 0 8px rgba(139, 92, 246, 0)',
                                                    '0 0 0 0px rgba(139, 92, 246, 0.4)'
                                                ]
                                            } : {}}
                                            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-white' : config.color}`} />
                                            </div>

                                            {isActive && (
                                                <motion.div
                                                    className={`absolute inset-0 rounded-full ${config.bg} opacity-30`}
                                                    animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                />
                                            )}
                                        </motion.div>

                                        {/* Generation label */}
                                        <span className={`text-xs font-mono ${isActive ? config.color : 'text-slate-500'
                                            } transition-colors`}>
                                            G{snapshot.generation}
                                        </span>
                                    </motion.button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-800 border-slate-700">
                                    <div className="text-xs space-y-1">
                                        <p className="font-medium text-white">{snapshot.name}</p>
                                        <p className="text-slate-400">Generation {snapshot.generation}</p>
                                        <p className="text-slate-400">Fitness: {snapshot.best_fitness?.toFixed(1) || 'N/A'}</p>
                                        <Badge variant="outline" className={`${config.bg}/20 ${config.color} border-0 text-xs mt-1`}>
                                            {snapshot.snapshot_type.replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
        </div>
    );
}