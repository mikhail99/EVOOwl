import { Solution, Criterion, Snapshot } from './types';

const API_BASE = 'http://localhost:8000/api';

export const backendApi = {
    evolution: {
        generateInitialPopulation: async (params: {
            problem: string;
            criteria: Criterion[];
            populationSize: number;
        }): Promise<Solution[]> => {
            const response = await fetch(`${API_BASE}/evolution/initial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to generate initial population');
            const data = await response.json();
            return data.solutions;
        },

        evaluateSolution: async (params: {
            problem: string;
            criteria: Criterion[];
            solution: Solution;
        }): Promise<Solution> => {
            const response = await fetch(`${API_BASE}/evolution/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to evaluate solution');
            const data = await response.json();
            return data.solution;
        },

        crossover: async (params: {
            problem: string;
            parent1: Solution;
            parent2: Solution;
        }): Promise<Solution> => {
            const response = await fetch(`${API_BASE}/evolution/crossover`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to perform crossover');
            return response.json();
        },

        mutate: async (params: {
            problem: string;
            solution: Solution;
            mutationType: string;
        }): Promise<Solution> => {
            const response = await fetch(`${API_BASE}/evolution/mutate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });
            if (!response.ok) throw new Error('Failed to perform mutation');
            return response.json();
        },
    },

    snapshots: {
        list: async (sessionId?: string): Promise<Snapshot[]> => {
            const url = new URL(`${API_BASE}/snapshots`);
            if (sessionId) url.searchParams.append('session_id', sessionId);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Failed to list snapshots');
            return response.json();
        },

        create: async (snapshot: Omit<Snapshot, 'id' | 'created_date'>): Promise<Snapshot> => {
            const response = await fetch(`${API_BASE}/snapshots`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(snapshot),
            });
            if (!response.ok) throw new Error('Failed to create snapshot');
            const data = await response.json();
            return data.snapshot;
        },

        delete: async (id: string): Promise<void> => {
            const response = await fetch(`${API_BASE}/snapshots/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete snapshot');
        },
    },
};
