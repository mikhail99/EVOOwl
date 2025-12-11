import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Sparkles, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import FitnessRing from './FitnessRing';
import { useState } from 'react';
import { Markdown } from '@/components/ui/Markdown';

export default function ChampionDisplay({ solution, generationFound }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(solution.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!solution) {
        return (
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl p-6">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Trophy className="w-12 h-12 text-slate-600 mb-3" />
                    </motion.div>
                    <p className="text-slate-400">No champion yet</p>
                    <p className="text-xs text-slate-500 mt-1">The best solution will appear here</p>
                </div>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-violet-900/20 to-slate-900/90 border-violet-500/30 backdrop-blur-xl">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl"
                        animate={{
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/10 to-transparent rounded-full blur-3xl"
                        animate={{
                            x: [0, -100, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
                    />
                </div>

                {/* Crown header */}
                <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-amber-500/10 to-transparent" />
                    <div className="flex items-center justify-center pt-4">
                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Crown className="w-8 h-8 text-amber-400" />
                        </motion.div>
                    </div>
                </div>

                <div className="relative p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white border-0">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    Champion Solution
                                </Badge>
                                {generationFound !== undefined && (
                                    <Badge variant="outline" className="border-violet-500/30 text-violet-400">
                                        Found in Gen {generationFound}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 font-mono">
                                ID: {solution.id?.slice(-8) || 'N/A'}
                            </p>
                        </div>
                        <FitnessRing score={solution.fitness || 0} size={80} strokeWidth={6} />
                    </div>

                    <div className="relative">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-4 prose prose-invert prose-sm max-w-none">
                            <Markdown content={solution.text || ''} />
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCopy}
                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    {/* Criteria breakdown */}
                    {solution.criteriaScores && Object.keys(solution.criteriaScores).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <h4 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Criteria Scores
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(solution.criteriaScores).map(([criterion, score]) => (
                                    <div
                                        key={criterion}
                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                                    >
                                        <span className="text-xs text-slate-400 truncate">{criterion}</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${score >= 8 ? 'bg-emerald-500' :
                                                            score >= 6 ? 'bg-violet-500' :
                                                                score >= 4 ? 'bg-amber-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(score / 10) * 100}%` }}
                                                    transition={{ duration: 0.5, delay: 0.2 }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-white w-6 text-right">
                                                {score}
                                            </span>
                                        </div>
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