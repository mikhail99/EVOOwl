import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    RotateCcw,
    SkipForward,
    Dna,
    Zap,
    Bookmark,
    History
} from 'lucide-react';
import DNAHelix from './DNAHelix';

export default function EvolutionControls({
    isRunning,
    isPaused,
    currentGeneration,
    totalGenerations,
    bestFitness,
    isViewingHistory,
    onStart,
    onPause,
    onResume,
    onReset,
    onNextGeneration,
    onSaveSnapshot,
    onToggleHistory
}) {
    const progress = totalGenerations > 0
        ? ((currentGeneration + 1) / totalGenerations) * 100
        : 0;

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Status */}
                <div className="flex items-center gap-4">
                    {isRunning && !isPaused && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <DNAHelix size="sm" />
                        </motion.div>
                    )}

                    <div>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={`${isRunning && !isPaused
                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        : isPaused
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                                    }`}
                            >
                                {isRunning && !isPaused ? (
                                    <><Zap className="w-3 h-3 mr-1" /> Evolving</>
                                ) : isPaused ? (
                                    <>Paused</>
                                ) : (
                                    <>Ready</>
                                )}
                            </Badge>

                            {currentGeneration >= 0 && (
                                <span className="text-sm text-slate-400">
                                    Generation <span className="font-mono text-white">{currentGeneration}</span>
                                    <span className="text-slate-600"> / {totalGenerations}</span>
                                </span>
                            )}
                        </div>

                        {/* Progress bar */}
                        {isRunning && (
                            <div className="mt-2 w-48">
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-violet-500 to-teal-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Best Fitness */}
                {bestFitness !== null && bestFitness !== undefined && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-teal-500/10 border border-violet-500/20">
                        <span className="text-xs text-slate-400">Best Fitness</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
                            {bestFitness.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                    {!isRunning ? (
                        <Button
                            onClick={onStart}
                            disabled={isViewingHistory}
                            className="bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-white disabled:opacity-50"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Start Evolution
                        </Button>
                    ) : (
                        <>
                            {isPaused ? (
                                <Button
                                    onClick={onResume}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                </Button>
                            ) : (
                                <Button
                                    onClick={onPause}
                                    variant="outline"
                                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </Button>
                            )}

                            <Button
                                onClick={onNextGeneration}
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                                disabled={!isPaused}
                            >
                                <SkipForward className="w-4 h-4 mr-2" />
                                Next Gen
                            </Button>
                        </>
                    )}

                    {currentGeneration >= 0 && (
                        <Button
                            onClick={onSaveSnapshot}
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            disabled={isViewingHistory}
                        >
                            <Bookmark className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    )}

                    <Button
                        onClick={onToggleHistory}
                        variant="outline"
                        className={`border-slate-600 hover:bg-slate-800 ${isViewingHistory ? 'text-violet-400 border-violet-500/30 bg-violet-500/10' : 'text-slate-300'
                            }`}
                    >
                        <History className="w-4 h-4 mr-2" />
                        History
                    </Button>

                    <Button
                        onClick={onReset}
                        variant="ghost"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}