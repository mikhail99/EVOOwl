import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GenerationStats } from '@/api/types';

type GenerationTimelineProps = {
    generations: GenerationStats[];
    currentGeneration: number;
    onSelectGeneration?: (index: number) => void;
};

export default function GenerationTimeline({
    generations,
    currentGeneration,
    onSelectGeneration
}: GenerationTimelineProps) {
    const maxFitness = Math.max(...generations.map(g => g.bestFitness || 0), 1);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-400">Evolution Timeline</h3>
                <span className="text-xs text-slate-500">
                    Generation {currentGeneration + 1} of {generations.length}
                </span>
            </div>

            <div className="relative">
                {/* Connection line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 -translate-y-1/2" />

                {/* Progress line */}
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-teal-400 -translate-y-1/2"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentGeneration / Math.max(generations.length - 1, 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />

                <TooltipProvider>
                    <div className="relative flex justify-between">
                        {generations.map((gen, index) => {
                            const isActive = index === currentGeneration;
                            const isPast = index < currentGeneration;
                            const fitnessHeight = (gen.bestFitness / maxFitness) * 40;

                            return (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <motion.button
                                            onClick={() => onSelectGeneration?.(index)}
                                            className={`relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${isActive ? 'z-10' : 'hover:z-10'
                                                }`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {/* Fitness bar */}
                                            <motion.div
                                                className={`w-3 rounded-full ${isActive ? 'bg-gradient-to-t from-violet-500 to-teal-400' :
                                                        isPast ? 'bg-gradient-to-t from-violet-600/60 to-teal-500/60' :
                                                            'bg-slate-700'
                                                    }`}
                                                initial={{ height: 0 }}
                                                animate={{ height: fitnessHeight || 4 }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                            />

                                            {/* Node */}
                                            <motion.div
                                                className={`relative w-4 h-4 rounded-full border-2 ${isActive
                                                        ? 'bg-violet-500 border-teal-400 shadow-lg shadow-violet-500/50'
                                                        : isPast
                                                            ? 'bg-violet-600/50 border-violet-400/50'
                                                            : 'bg-slate-800 border-slate-600'
                                                    }`}
                                                animate={isActive ? {
                                                    scale: [1, 1.2, 1],
                                                    boxShadow: [
                                                        '0 0 10px rgba(139, 92, 246, 0.5)',
                                                        '0 0 20px rgba(139, 92, 246, 0.8)',
                                                        '0 0 10px rgba(139, 92, 246, 0.5)'
                                                    ]
                                                } : {}}
                                                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        className="absolute inset-0 rounded-full bg-violet-400"
                                                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    />
                                                )}
                                            </motion.div>

                                            {/* Generation number */}
                                            <span className={`text-xs font-mono ${isActive ? 'text-violet-300' : 'text-slate-500'
                                                }`}>
                                                G{index}
                                            </span>
                                        </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-slate-800 border-slate-700">
                                        <div className="text-xs">
                                            <p className="font-medium text-white">Generation {index}</p>
                                            <p className="text-slate-400">Best: {gen.bestFitness?.toFixed(1) || 0}</p>
                                            <p className="text-slate-400">Avg: {gen.avgFitness?.toFixed(1) || 0}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
}