import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Target,
    Scale,
    Plus,
    X,
    Lightbulb,
    Settings2
} from 'lucide-react';

export default function ProblemSetup({
    problem,
    setProblem,
    criteria,
    setCriteria,
    config,
    setConfig,
    onStartEvolution,
    isValid
}) {
    const addCriterion = () => {
        setCriteria([...criteria, { name: '', weight: 1 }]);
    };

    const removeCriterion = (index) => {
        setCriteria(criteria.filter((_, i) => i !== index));
    };

    const updateCriterion = (index, field, value) => {
        const updated = [...criteria];
        updated[index] = { ...updated[index], [field]: value };
        setCriteria(updated);
    };

    return (
        <div className="space-y-6">
            {/* Problem Statement */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-violet-500/20">
                                <Target className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Problem Statement</h3>
                                <p className="text-xs text-slate-400">Define what you want to solve</p>
                            </div>
                        </div>
                        <Textarea
                            value={problem}
                            onChange={(e) => setProblem(e.target.value)}
                            placeholder="Describe the problem you want to evolve solutions for..."
                            className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 min-h-[120px] resize-none focus:border-violet-500/50 focus:ring-violet-500/20"
                        />
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-slate-500">
                                    Be specific and detailed for better results
                                </span>
                            </div>
                            <Button
                                size="sm"
                                disabled={!isValid}
                                onClick={onStartEvolution}
                                className="bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Begin Evolution
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Evaluation Criteria */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500" />
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-teal-500/20">
                                    <Scale className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Evaluation Criteria</h3>
                                    <p className="text-xs text-slate-400">How solutions will be judged</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={addCriterion}
                                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Criterion
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {criteria.map((criterion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                                >
                                    <Badge
                                        variant="outline"
                                        className="border-teal-500/30 text-teal-400 bg-teal-500/10 w-8 h-8 rounded-lg flex items-center justify-center p-0"
                                    >
                                        {index + 1}
                                    </Badge>
                                    <Input
                                        value={criterion.name}
                                        onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                                        placeholder="Criterion name (e.g., Feasibility, Creativity)"
                                        className="bg-transparent border-slate-700 text-slate-200 flex-1"
                                    />
                                    <div className="flex items-center gap-2 w-32">
                                        <span className="text-xs text-slate-500">Weight:</span>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={criterion.weight}
                                            onChange={(e) => updateCriterion(index, 'weight', parseInt(e.target.value) || 1)}
                                            className="bg-transparent border-slate-700 text-slate-200 w-16"
                                        />
                                    </div>
                                    {criteria.length > 1 && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => removeCriterion(index)}
                                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Evolution Parameters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-amber-500/20">
                                <Settings2 className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Evolution Parameters</h3>
                                <p className="text-xs text-slate-400">Fine-tune the genetic algorithm</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300">Population Size</Label>
                                    <span className="text-sm font-mono text-amber-400">{config.populationSize}</span>
                                </div>
                                <Slider
                                    value={[config.populationSize]}
                                    onValueChange={([v]) => setConfig({ ...config, populationSize: v })}
                                    min={4}
                                    max={20}
                                    step={2}
                                    className="[&_[role=slider]]:bg-amber-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300">Generations</Label>
                                    <span className="text-sm font-mono text-amber-400">{config.generations}</span>
                                </div>
                                <Slider
                                    value={[config.generations]}
                                    onValueChange={([v]) => setConfig({ ...config, generations: v })}
                                    min={3}
                                    max={20}
                                    step={1}
                                    className="[&_[role=slider]]:bg-amber-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300">Mutation Rate</Label>
                                    <span className="text-sm font-mono text-amber-400">{(config.mutationRate * 100).toFixed(0)}%</span>
                                </div>
                                <Slider
                                    value={[config.mutationRate * 100]}
                                    onValueChange={([v]) => setConfig({ ...config, mutationRate: v / 100 })}
                                    min={10}
                                    max={50}
                                    step={5}
                                    className="[&_[role=slider]]:bg-amber-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-300">Crossover Rate</Label>
                                    <span className="text-sm font-mono text-amber-400">{(config.crossoverRate * 100).toFixed(0)}%</span>
                                </div>
                                <Slider
                                    value={[config.crossoverRate * 100]}
                                    onValueChange={([v]) => setConfig({ ...config, crossoverRate: v / 100 })}
                                    min={50}
                                    max={90}
                                    step={5}
                                    className="[&_[role=slider]]:bg-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

        </div>
    );
}