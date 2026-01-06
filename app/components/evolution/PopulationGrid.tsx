import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SolutionCard from './SolutionCard';
import { Users, TrendingUp } from 'lucide-react';
import type { EvolutionTypesById, Solution } from '@/api/types';

type PopulationGridProps = {
    solutions: Solution[];
    selectedSolution: Solution | null;
    onSelectSolution: (solution: Solution) => void;
    evolvingIds?: string[];
    evolutionTypes?: EvolutionTypesById;
};

export default function PopulationGrid({
    solutions,
    selectedSolution,
    onSelectSolution,
    evolvingIds = [],
    evolutionTypes = {}
}: PopulationGridProps) {
    const sortedSolutions = [...solutions].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));

    const avgFitness = solutions.length > 0
        ? (solutions.reduce((sum, s) => sum + (s.fitness || 0), 0) / solutions.length).toFixed(1)
        : 0;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/20">
                        <Users className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Population</h3>
                        <p className="text-xs text-slate-400">{solutions.length} solutions</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-slate-400">Avg Fitness:</span>
                    <span className="text-sm font-semibold text-teal-400">{avgFitness}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <AnimatePresence mode="popLayout">
                    {sortedSolutions.map((solution, index) => (
                        <motion.div
                            key={solution.id}
                            layout
                            transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <SolutionCard
                                solution={solution}
                                rank={index + 1}
                                isSelected={selectedSolution?.id === solution.id}
                                onSelect={onSelectSolution}
                                isEvolving={evolvingIds.includes(solution.id)}
                                evolutionType={evolutionTypes[solution.id]}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {solutions.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="p-4 rounded-2xl bg-slate-800/50 mb-4"
                        >
                            <Users className="w-12 h-12 text-slate-600" />
                        </motion.div>
                        <p className="text-slate-400 font-medium">No solutions yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Configure your problem and start evolution
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}