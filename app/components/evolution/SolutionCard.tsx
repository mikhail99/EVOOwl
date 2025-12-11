import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Dna, Sparkles, GitMerge } from 'lucide-react';
import FitnessRing from './FitnessRing';
import { Markdown } from '@/components/ui/Markdown';

export default function SolutionCard({
    solution,
    rank,
    isSelected,
    onSelect,
    isEvolving,
    evolutionType
}) {
    const [expanded, setExpanded] = useState(false);

    const getRankBadge = () => {
        if (rank === 1) return { bg: 'bg-gradient-to-r from-amber-500 to-yellow-400', text: '🥇 Champion' };
        if (rank === 2) return { bg: 'bg-gradient-to-r from-slate-400 to-slate-300', text: '🥈 Elite' };
        if (rank === 3) return { bg: 'bg-gradient-to-r from-amber-700 to-amber-600', text: '🥉 Strong' };
        return null;
    };

    const rankBadge = getRankBadge();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isSelected ? 1.02 : 1,
                boxShadow: isSelected
                    ? '0 0 40px rgba(139, 92, 246, 0.3)'
                    : '0 0 0px rgba(0,0,0,0)'
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01 }}
            className="relative"
        >
            {/* Evolution glow effect */}
            <AnimatePresence>
                {isEvolving && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/30 via-teal-400/30 to-violet-500/30"
                        style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s linear infinite'
                        }}
                    />
                )}
            </AnimatePresence>

            <Card
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${isSelected
                        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-violet-500/50'
                        : 'bg-slate-900/60 border-slate-700/50 hover:border-slate-600/50'
                    } backdrop-blur-xl`}
                onClick={() => onSelect?.(solution)}
            >
                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${solution.fitness >= 80 ? 'from-emerald-500 via-teal-400 to-emerald-500' :
                        solution.fitness >= 60 ? 'from-violet-500 via-purple-400 to-violet-500' :
                            solution.fitness >= 40 ? 'from-amber-500 via-yellow-400 to-amber-500' :
                                'from-red-500 via-rose-400 to-red-500'
                    }`} />

                <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left side: Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-mono text-slate-500">
                                    #{solution.id?.slice(-6) || 'N/A'}
                                </span>
                                {rankBadge && (
                                    <Badge className={`${rankBadge.bg} text-white text-xs border-0`}>
                                        {rankBadge.text}
                                    </Badge>
                                )}
                                {evolutionType && (
                                    <Badge variant="outline" className="text-xs border-teal-500/30 text-teal-400 bg-teal-500/10">
                                        {evolutionType === 'mutation' ? (
                                            <><Dna className="w-3 h-3 mr-1" /> Mutated</>
                                        ) : evolutionType === 'crossover' ? (
                                            <><GitMerge className="w-3 h-3 mr-1" /> Crossed</>
                                        ) : (
                                            <><Sparkles className="w-3 h-3 mr-1" /> New</>
                                        )}
                                    </Badge>
                                )}
                            </div>

                            <div className={`${expanded ? '' : 'line-clamp-3'} text-sm text-slate-300 prose prose-invert prose-sm max-w-none`}>
                                <Markdown content={solution.text || ''} />
                            </div>

                            {solution.text?.length > 150 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 mt-2 transition-colors"
                                >
                                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {expanded ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>

                        {/* Right side: Fitness */}
                        <div className="flex-shrink-0">
                            <FitnessRing score={solution.fitness || 0} size={70} strokeWidth={5} />
                        </div>
                    </div>

                    {/* Criteria scores */}
                    {solution.criteriaScores && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(solution.criteriaScores).map(([criterion, score]) => (
                                    <div
                                        key={criterion}
                                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/50"
                                    >
                                        <span className="text-xs text-slate-400">{criterion}</span>
                                        <span className={`text-xs font-semibold ${score >= 8 ? 'text-emerald-400' :
                                                score >= 6 ? 'text-violet-400' :
                                                    score >= 4 ? 'text-amber-400' :
                                                        'text-red-400'
                                            }`}>{score}/10</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}