import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import { Dna, Settings, BarChart3, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import DNAHelix from '@/components/evolution/DNAHelix';
import ProblemSetup from '@/components/evolution/ProblemSetup';
import PopulationGrid from '@/components/evolution/PopulationGrid';
import GenerationTimeline from '@/components/evolution/GenerationTimeline';
import ActivityFeed from '@/components/evolution/ActivityFeed';
import FitnessChart from '@/components/evolution/FitnessChart';
import EvolutionControls from '@/components/evolution/EvolutionControls';
import ChampionDisplay from '@/components/evolution/ChampionDisplay';
import HistoryPanel from '@/components/evolution/HistoryPanel';
import HistoryTimeline from '@/components/evolution/HistoryTimeline';
import SaveSnapshotDialog from '@/components/evolution/SaveSnapshotDialog';

export default function Evolution() {
    const [activeTab, setActiveTab] = useState('setup');
    const [problem, setProblem] = useState('');
    const [criteria, setCriteria] = useState([
        { name: 'Feasibility', weight: 2 },
        { name: 'Innovation', weight: 1 },
        { name: 'Clarity', weight: 1 }
    ]);
    const [config, setConfig] = useState({
        populationSize: 6,
        generations: 10,
        mutationRate: 0.3,
        crossoverRate: 0.7
    });

    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentGeneration, setCurrentGeneration] = useState(-1);
    const [population, setPopulation] = useState([]);
    const [generations, setGenerations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedSolution, setSelectedSolution] = useState(null);
    const [champion, setChampion] = useState(null);
    const [championGeneration, setChampionGeneration] = useState(null);
    const [evolvingIds, setEvolvingIds] = useState([]);
    const [evolutionTypes, setEvolutionTypes] = useState({});
    const [sessionId, setSessionId] = useState(null);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [isViewingHistory, setIsViewingHistory] = useState(false);
    const [currentSnapshotId, setCurrentSnapshotId] = useState(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);

    const evolutionRef = useRef({ shouldStop: false, isPaused: false });

    // Load snapshots for current session
    const { data: snapshots = [], refetch: refetchSnapshots } = useQuery({
        queryKey: ['evolutionSnapshots', sessionId],
        queryFn: async () => {
            if (!sessionId) return [];
            const allSnapshots = await base44.entities.EvolutionSnapshot.list('-created_date', 100);
            return allSnapshots.filter(s => s.session_id === sessionId);
        },
        enabled: !!sessionId,
        initialData: []
    });

    const isValid = problem.trim().length > 10 && criteria.some(c => c.name.trim());

    const addActivity = useCallback((type, message, details, score) => {
        const activity = {
            id: Date.now() + Math.random(),
            type,
            message,
            details,
            score,
            timestamp: new Date().toLocaleTimeString()
        };
        setActivities(prev => [activity, ...prev].slice(0, 50));
    }, []);

    // Save snapshot function
    const saveSnapshot = useCallback(async (snapshotType, customName = null) => {
        if (!sessionId) return;

        try {
            const snapshotData = {
                name: customName || `Gen ${currentGeneration} - ${snapshotType.replace(/_/g, ' ')}`,
                snapshot_type: snapshotType,
                generation: currentGeneration,
                problem,
                criteria,
                config,
                population: JSON.parse(JSON.stringify(population)),
                generations_data: JSON.parse(JSON.stringify(generations)),
                champion: champion ? JSON.parse(JSON.stringify(champion)) : null,
                champion_generation: championGeneration,
                best_fitness: champion?.fitness || 0,
                session_id: sessionId
            };

            const snapshot = await base44.entities.EvolutionSnapshot.create(snapshotData);
            await refetchSnapshots();

            if (snapshotType === 'manual') {
                toast.success('Snapshot saved successfully');
            }

            return snapshot;
        } catch (error) {
            console.error('Failed to save snapshot:', error);
            toast.error('Failed to save snapshot');
        }
    }, [sessionId, currentGeneration, problem, criteria, config, population, generations, champion, championGeneration, refetchSnapshots]);

    // Restore from snapshot
    const restoreSnapshot = useCallback(async (snapshot) => {
        try {
            // Stop any running evolution
            if (isRunning) {
                evolutionRef.current.shouldStop = true;
                setIsRunning(false);
            }

            // Restore state
            setProblem(snapshot.problem);
            setCriteria(snapshot.criteria);
            setConfig(snapshot.config);
            setPopulation(snapshot.population);
            setGenerations(snapshot.generations_data);
            setChampion(snapshot.champion);
            setChampionGeneration(snapshot.champion_generation);
            setCurrentGeneration(snapshot.generation);
            setCurrentSnapshotId(snapshot.id);
            setIsViewingHistory(true);

            setActiveTab('evolution');

            addActivity('evaluation', 'Snapshot restored', `Restored to Generation ${snapshot.generation}`, snapshot.best_fitness);
            toast.success(`Restored: ${snapshot.name}`);
        } catch (error) {
            console.error('Failed to restore snapshot:', error);
            toast.error('Failed to restore snapshot');
        }
    }, [isRunning, addActivity]);

    // Delete snapshot
    const deleteSnapshot = useCallback(async (snapshotId) => {
        try {
            await base44.entities.EvolutionSnapshot.delete(snapshotId);
            await refetchSnapshots();

            if (snapshotId === currentSnapshotId) {
                setCurrentSnapshotId(null);
                setIsViewingHistory(false);
            }

            toast.success('Snapshot deleted');
        } catch (error) {
            console.error('Failed to delete snapshot:', error);
            toast.error('Failed to delete snapshot');
        }
    }, [currentSnapshotId, refetchSnapshots]);

    // Export snapshot
    const exportSnapshot = useCallback((snapshot) => {
        try {
            const dataStr = JSON.stringify(snapshot, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `evolution-snapshot-gen${snapshot.generation}-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Snapshot exported');
        } catch (error) {
            console.error('Failed to export snapshot:', error);
            toast.error('Failed to export snapshot');
        }
    }, []);

    // Handle manual snapshot save
    const handleSaveManualSnapshot = useCallback(async (name) => {
        setIsSavingSnapshot(true);
        await saveSnapshot('manual', name);
        setIsSavingSnapshot(false);
        setShowSaveDialog(false);
    }, [saveSnapshot]);

    const generateInitialPopulation = async () => {
        addActivity('evaluation', 'Generating initial population...', `Creating ${config.populationSize} diverse solutions`);

        const criteriaText = criteria
            .filter(c => c.name.trim())
            .map(c => `${c.name} (weight: ${c.weight})`)
            .join(', ');

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Generate ${config.populationSize} distinct and creative solutions for the following problem:

Problem: ${problem}

Evaluation Criteria: ${criteriaText}

For each solution, provide a unique approach. Return as JSON array with objects containing "text" field only.
Make each solution substantially different in approach, methodology, or perspective.`,
            response_json_schema: {
                type: "object",
                properties: {
                    solutions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                text: { type: "string" }
                            },
                            required: ["text"]
                        }
                    }
                },
                required: ["solutions"]
            }
        });

        const solutions = (response.solutions || []).map((s, i) => ({
            id: `gen0-${i}-${Date.now()}`,
            text: s.text,
            fitness: null,
            criteriaScores: {},
            generation: 0
        }));

        return solutions;
    };

    const evaluateSolution = async (solution) => {
        const criteriaText = criteria
            .filter(c => c.name.trim())
            .map(c => `${c.name} (weight: ${c.weight})`)
            .join(', ');

        const criteriaNames = criteria.filter(c => c.name.trim()).map(c => c.name);

        const scoreProperties = {};
        criteriaNames.forEach(name => {
            scoreProperties[name] = { type: "number", minimum: 0, maximum: 10 };
        });

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Evaluate this solution for the given problem.

Problem: ${problem}

Solution: ${solution.text}

Criteria to evaluate (each scored 0-10):
${criteriaText}

Score each criterion from 0-10. Calculate overall fitness as weighted average.`,
            response_json_schema: {
                type: "object",
                properties: {
                    scores: {
                        type: "object",
                        properties: scoreProperties
                    },
                    overall_fitness: { type: "number", minimum: 0, maximum: 100 },
                    reasoning: { type: "string" }
                },
                required: ["scores", "overall_fitness"]
            }
        });

        return {
            ...solution,
            fitness: response.overall_fitness || 0,
            criteriaScores: response.scores || {},
            reasoning: response.reasoning
        };
    };

    const evaluatePopulation = useCallback(async (solutions) => {
        addActivity('evaluation', 'Evaluating population...', `Scoring ${solutions.length} solutions`);

        const evaluated = [];
        for (let i = 0; i < solutions.length; i++) {
            if (evolutionRef.current.shouldStop) break;

            setEvolvingIds([solutions[i].id]);
            const result = await evaluateSolution(solutions[i]);
            evaluated.push(result);

            addActivity('evaluation', `Evaluated solution`, `Score: ${result.fitness?.toFixed(1)}`, result.fitness);

            // Update champion if this is the best
            if (!champion || result.fitness > champion.fitness) {
                setChampion(result);
                const gen = currentGeneration >= 0 ? currentGeneration : 0;
                setChampionGeneration(gen);
                addActivity('newBest', 'New champion found!', `Fitness: ${result.fitness?.toFixed(1)}`, result.fitness);

                // Auto-save snapshot when new champion is found
                if (sessionId && gen > 0) {
                    await saveSnapshot('new_champion');
                }
            }
        }

        setEvolvingIds([]);
        return evaluated;
    }, [addActivity, champion, currentGeneration, sessionId, saveSnapshot]);

    const selectParents = useCallback((evaluatedPopulation) => {
        // Tournament selection
        const tournamentSize = 3;
        const selected = [];

        for (let i = 0; i < 2; i++) {
            const tournament = [];
            for (let j = 0; j < tournamentSize; j++) {
                const idx = Math.floor(Math.random() * evaluatedPopulation.length);
                tournament.push(evaluatedPopulation[idx]);
            }
            selected.push(tournament.reduce((best, curr) =>
                (curr.fitness || 0) > (best.fitness || 0) ? curr : best
            ));
        }

        addActivity('selection', 'Parents selected', `Tournament selection completed`);
        return selected;
    }, [addActivity]);

    const crossover = useCallback(async (parent1, parent2) => {
        addActivity('crossover', 'Performing crossover...', 'Combining two parent solutions');

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Create a new solution by synthesizing the best ideas from these two parent solutions.

Problem: ${problem}

Parent Solution 1: ${parent1.text}

Parent Solution 2: ${parent2.text}

Create a coherent new solution that combines the strongest aspects of both parents.
The result should be a novel synthesis, not just concatenation.`,
            response_json_schema: {
                type: "object",
                properties: {
                    text: { type: "string" }
                },
                required: ["text"]
            }
        });

        return {
            id: `cross-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text: response.text,
            fitness: null,
            criteriaScores: {},
            generation: currentGeneration + 1,
            parentIds: [parent1.id, parent2.id]
        };
    }, [addActivity, problem, currentGeneration]);

    const mutate = useCallback(async (solution) => {
        addActivity('mutation', 'Performing mutation...', 'Introducing variation');

        const mutationTypes = [
            'Introduce a novel but feasible variation to the core methodology',
            'Strengthen one aspect while maintaining overall coherence',
            'Add an innovative twist that enhances the solution',
            'Refine and optimize the existing approach',
            'Challenge an assumption and propose an alternative'
        ];

        const mutationType = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `Mutate this solution by: ${mutationType}

Problem: ${problem}

Original Solution: ${solution.text}

Create a modified version that maintains the core value while introducing meaningful variation.`,
            response_json_schema: {
                type: "object",
                properties: {
                    text: { type: "string" }
                },
                required: ["text"]
            }
        });

        return {
            id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            text: response.text,
            fitness: null,
            criteriaScores: {},
            generation: currentGeneration + 1,
            parentId: solution.id,
            mutationType
        };
    }, [addActivity, problem, currentGeneration]);

    const createNextGeneration = useCallback(async (evaluatedPopulation) => {
        const newPopulation = [];
        const newEvolutionTypes = {};

        // Elitism: keep the best solution
        const sorted = [...evaluatedPopulation].sort((a, b) => (b.fitness || 0) - (a.fitness || 0));
        const elite = { ...sorted[0], id: `elite-${Date.now()}` };
        newPopulation.push(elite);
        newEvolutionTypes[elite.id] = 'elite';

        while (newPopulation.length < config.populationSize) {
            if (evolutionRef.current.shouldStop) break;

            const rand = Math.random();

            if (rand < config.crossoverRate && newPopulation.length < config.populationSize - 1) {
                // Crossover
                const [parent1, parent2] = selectParents(evaluatedPopulation);
                const child = await crossover(parent1, parent2);
                newPopulation.push(child);
                newEvolutionTypes[child.id] = 'crossover';
            } else if (rand < config.crossoverRate + config.mutationRate) {
                // Mutation
                const parent = sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
                const child = await mutate(parent);
                newPopulation.push(child);
                newEvolutionTypes[child.id] = 'mutation';
            } else {
                // Direct copy with slight modification
                const parent = sorted[Math.floor(Math.random() * sorted.length)];
                const child = await mutate(parent);
                newPopulation.push(child);
                newEvolutionTypes[child.id] = 'mutation';
            }
        }

        setEvolutionTypes(newEvolutionTypes);
        return newPopulation;
    }, [config.populationSize, config.crossoverRate, config.mutationRate, selectParents, crossover, mutate]);

    const runEvolution = async () => {
        evolutionRef.current.shouldStop = false;
        evolutionRef.current.isPaused = false;

        setIsRunning(true);
        setIsPaused(false);
        setActiveTab('evolution');
        setActivities([]);
        setGenerations([]);
        setChampion(null);
        setChampionGeneration(null);
        setIsViewingHistory(false);
        setCurrentSnapshotId(null);

        // Create new session ID
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setSessionId(newSessionId);

        // Generate initial population
        setCurrentGeneration(0);
        addActivity('evaluation', 'Starting evolution...', 'Initializing Generation 0');

        let currentPop = await generateInitialPopulation();
        setPopulation(currentPop);

        // Evaluate initial population
        currentPop = await evaluatePopulation(currentPop);
        setPopulation(currentPop);

        const bestFitness = Math.max(...currentPop.map(s => s.fitness || 0));
        const avgFitness = currentPop.reduce((sum, s) => sum + (s.fitness || 0), 0) / currentPop.length;

        setGenerations([{ generation: 0, bestFitness, avgFitness }]);

        // Save initial snapshot
        if (newSessionId) {
            await saveSnapshot('generation_complete');
        }

        // Evolution loop
        for (let gen = 1; gen < config.generations; gen++) {
            // Check for pause
            while (evolutionRef.current.isPaused && !evolutionRef.current.shouldStop) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (evolutionRef.current.shouldStop) break;

            setCurrentGeneration(gen);
            addActivity('evaluation', `Starting Generation ${gen}`, 'Creating next generation');

            // Create and evaluate next generation
            currentPop = await createNextGeneration(currentPop);
            setPopulation(currentPop);

            currentPop = await evaluatePopulation(currentPop);
            setPopulation(currentPop);

            const genBestFitness = Math.max(...currentPop.map(s => s.fitness || 0));
            const genAvgFitness = currentPop.reduce((sum, s) => sum + (s.fitness || 0), 0) / currentPop.length;

            setGenerations(prev => [...prev, {
                generation: gen,
                bestFitness: genBestFitness,
                avgFitness: genAvgFitness
            }]);

            // Update champion
            const genChampion = currentPop.reduce((best, curr) =>
                (curr.fitness || 0) > (best.fitness || 0) ? curr : best
            );
            if (!champion || genChampion.fitness > champion.fitness) {
                setChampion(genChampion);
                setChampionGeneration(gen);
            }

            // Save snapshot at end of each generation (except last, handled below)
            if (gen < config.generations - 1) {
                await saveSnapshot('generation_complete');
            }
        }

        // Save final snapshot
        await saveSnapshot('evolution_complete');

        addActivity('newBest', 'Evolution complete!', `Final champion fitness: ${champion?.fitness?.toFixed(1) || 'N/A'}`);
        setIsRunning(false);
    };

    const handlePause = () => {
        evolutionRef.current.isPaused = true;
        setIsPaused(true);
    };

    const handleResume = () => {
        evolutionRef.current.isPaused = false;
        setIsPaused(false);
    };

    const handleReset = () => {
        evolutionRef.current.shouldStop = true;
        setIsRunning(false);
        setIsPaused(false);
        setCurrentGeneration(-1);
        setPopulation([]);
        setGenerations([]);
        setActivities([]);
        setChampion(null);
        setChampionGeneration(null);
        setIsViewingHistory(false);
        setCurrentSnapshotId(null);
        setActiveTab('setup');
    };

    const handleContinueFromHistory = () => {
        setIsViewingHistory(false);
        setCurrentSnapshotId(null);
        toast.info('Ready to continue evolution from this point');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">

            {/* Header */}
            <header className="relative z-10 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: isRunning && !isPaused ? 360 : 0 }}
                                transition={{ duration: 8, repeat: isRunning && !isPaused ? Infinity : 0, ease: "linear" }}
                            >
                                <DNAHelix size="md" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                                    Solution Evolution
                                </h1>
                                <p className="text-sm text-slate-400">Genetic Algorithm for Text Solutions</p>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-slate-800/50 border border-slate-700/50">
                                <TabsTrigger value="setup" className="data-[state=active]:bg-violet-600">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Setup
                                </TabsTrigger>
                                <TabsTrigger value="evolution" className="data-[state=active]:bg-violet-600">
                                    <Dna className="w-4 h-4 mr-2" />
                                    Evolution
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="max-w-3xl mx-auto"
                        >
                            <ProblemSetup
                                problem={problem}
                                setProblem={setProblem}
                                criteria={criteria}
                                setCriteria={setCriteria}
                                config={config}
                                setConfig={setConfig}
                                onStartEvolution={runEvolution}
                                isValid={isValid}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'evolution' && (
                        <motion.div
                            key="evolution"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Controls */}
                            <EvolutionControls
                                isRunning={isRunning}
                                isPaused={isPaused}
                                currentGeneration={currentGeneration}
                                totalGenerations={config.generations}
                                bestFitness={champion?.fitness}
                                isViewingHistory={isViewingHistory}
                                onStart={isViewingHistory ? handleContinueFromHistory : runEvolution}
                                onPause={handlePause}
                                onResume={handleResume}
                                onReset={handleReset}
                                onSaveSnapshot={() => setShowSaveDialog(true)}
                                onToggleHistory={() => setShowHistoryPanel(!showHistoryPanel)}
                            />

                            {/* History Timeline */}
                            {snapshots.length > 0 && (
                                <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl">
                                    <HistoryTimeline
                                        snapshots={snapshots}
                                        currentSnapshotId={currentSnapshotId}
                                        onSelectSnapshot={restoreSnapshot}
                                    />
                                </div>
                            )}

                            {/* Generation Timeline */}
                            {generations.length > 0 && (
                                <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl">
                                    <GenerationTimeline
                                        generations={generations}
                                        currentGeneration={currentGeneration}
                                        onSelectGeneration={(idx) => setCurrentGeneration(idx)}
                                    />
                                </div>
                            )}

                            {/* Main Grid */}
                            <div className={`grid grid-cols-1 gap-6 ${showHistoryPanel ? 'lg:grid-cols-12' : 'lg:grid-cols-12'
                                }`}>
                                {/* Population */}
                                <div className={`${showHistoryPanel ? 'lg:col-span-4' : 'lg:col-span-5'} bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl min-h-[500px]`}>
                                    <PopulationGrid
                                        solutions={population}
                                        selectedSolution={selectedSolution}
                                        onSelectSolution={setSelectedSolution}
                                        evolvingIds={evolvingIds}
                                        evolutionTypes={evolutionTypes}
                                    />
                                </div>

                                {/* Middle Column */}
                                <div className={`${showHistoryPanel ? 'lg:col-span-4' : 'lg:col-span-4'} space-y-6`}>
                                    {/* Champion */}
                                    <ChampionDisplay
                                        solution={champion}
                                        generationFound={championGeneration}
                                    />

                                    {/* Fitness Chart */}
                                    {generations.length > 0 && (
                                        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl h-64">
                                            <FitnessChart data={generations} />
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Activity Feed or History Panel */}
                                <div className={`${showHistoryPanel ? 'lg:col-span-4' : 'lg:col-span-3'} min-h-[500px]`}>
                                    <AnimatePresence mode="wait">
                                        {showHistoryPanel ? (
                                            <motion.div
                                                key="history"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="h-full"
                                            >
                                                <HistoryPanel
                                                    snapshots={snapshots}
                                                    currentSnapshotId={currentSnapshotId}
                                                    isViewingHistory={isViewingHistory}
                                                    onRestore={restoreSnapshot}
                                                    onDelete={deleteSnapshot}
                                                    onExport={exportSnapshot}
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="activity"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-xl h-full"
                                            >
                                                <ActivityFeed activities={activities} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Save Snapshot Dialog */}
                            <SaveSnapshotDialog
                                open={showSaveDialog}
                                onOpenChange={setShowSaveDialog}
                                onSave={handleSaveManualSnapshot}
                                defaultName={`Manual checkpoint - Gen ${currentGeneration}`}
                                generation={currentGeneration}
                                isSaving={isSavingSnapshot}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Animated background elements */}
            <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
        </div>
    );
}