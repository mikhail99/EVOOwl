export interface Criterion {
  name: string
  weight: number
}

export interface EvolutionConfig {
  populationSize: number
  generations: number
  mutationRate: number
  crossoverRate: number
}

export interface Solution {
  id: string
  text: string
  fitness: number | null
  criteriaScores: Record<string, number>
  generation: number
  parentId?: string
  parentIds?: string[]
  mutationType?: string
  reasoning?: string
}

export interface EvolutionRunStartResponse {
  runId: string
  resultsDir: string
}

export interface EvolutionRunStatusResponse {
  runId: string
  status: 'running' | 'completed' | 'failed' | 'unknown'
  resultsDir: string
  lastGeneration: number | null
  bestProgram?: {
    id?: string
    code: string
    combined_score?: number
    public_metrics?: Record<string, any>
    text_feedback?: string
    generation?: number
    markdown?: string
  }
  topPrograms?: Array<{
    id?: string
    code: string
    markdown?: string
    fitness?: number | null
    generation?: number
  }>
  error?: string | null
}

export interface Snapshot {
  id: string
  name: string
  snapshot_type: string
  generation: number
  problem: string
  criteria: Criterion[]
  config: EvolutionConfig
  population: Solution[]
  generations_data: Array<{
    generation: number
    bestFitness: number
    avgFitness: number
  }>
  champion: Solution | null
  champion_generation: number | null
  best_fitness: number
  session_id: string
  created_date?: string
}
