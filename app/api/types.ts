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

export interface Snapshot {
    id: string;
    name: string;
    snapshot_type: string;
    generation: number;
    problem: string;
    criteria: Criterion[];
    config: Config;
    population: Solution[];
    generations_data: any[];
    champion: Solution | null;
    champion_generation: number | null;
    best_fitness: number;
    session_id: string;
    created_date?: string;
}
