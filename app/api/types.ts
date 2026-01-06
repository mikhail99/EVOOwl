export interface Criterion {
    name: string;
    weight: number;
}

export interface Solution {
    id: string;
    text: string;
    fitness: number | null;
    criteriaScores: Record<string, number>;
    generation: number;
    parentId?: string;
    parentIds?: string[];
    mutationType?: string;
    reasoning?: string;
}

export interface Config {
    populationSize: number;
    generations: number;
    mutationRate: number;
    crossoverRate: number;
}

export type SnapshotType =
    | 'manual'
    | 'new_champion'
    | 'generation_complete'
    | 'evolution_complete'
    | string;

export interface Snapshot {
    id: string;
    name: string;
    snapshot_type: SnapshotType;
    generation: number;
    problem: string;
    criteria: Criterion[];
    config: Config;
    population: Solution[];
    generations_data: GenerationStats[];
    champion: Solution | null;
    champion_generation: number | null;
    best_fitness: number;
    session_id: string;
    created_date?: string;
}

export type ActivityType =
    | 'mutation'
    | 'crossover'
    | 'evaluation'
    | 'selection'
    | 'newBest'
    | 'error'
    | string;

export interface Activity {
    id: string | number;
    type: ActivityType;
    message: string;
    details?: string;
    score?: number;
    timestamp?: string;
}

export interface GenerationStats {
    generation: number;
    bestFitness: number;
    avgFitness: number;
}

export type EvolutionType = 'elite' | 'crossover' | 'mutation' | string;
export type EvolutionTypesById = Record<string, EvolutionType>;
