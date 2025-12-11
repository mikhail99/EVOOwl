import {
  Criterion,
  Solution,
  Snapshot,
  EvolutionRunStartResponse,
  EvolutionRunStatusResponse
} from '@/api/types'

const API_BASE_URL = (((import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:8000/api').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`API ${resp.status}: ${text}`)
  }

  return resp.json() as Promise<T>
}

export const backendApi = {
  evolution: {
    generateInitialPopulation: async (params: {
      problem: string
      criteria: Criterion[]
      populationSize: number
    }): Promise<Solution[]> => {
      const data = await request<{ solutions: Solution[] }>('/evolution/initial', {
        method: 'POST',
        body: JSON.stringify(params)
      })
      return data.solutions
    },
    evaluateSolution: async (params: {
      problem: string
      criteria: Criterion[]
      solution: Solution
    }): Promise<Solution> => {
      const data = await request<{ solution: Solution }>('/evolution/evaluate', {
        method: 'POST',
        body: JSON.stringify(params)
      })
      return data.solution
    },
    crossover: async (params: {
      problem: string
      parent1: Solution
      parent2: Solution
    }): Promise<Solution> => {
      return request<Solution>('/evolution/crossover', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    },
    mutate: async (params: {
      problem: string
      solution: Solution
      mutationType?: string
    }): Promise<Solution> => {
      return request<Solution>('/evolution/mutate', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    },
    startEvolutionRun: async (params: {
      problem: string
      criteria: Criterion[]
      config?: {
        numGenerations?: number
        maxParallelJobs?: number
        patchTypes?: string[]
        patchTypeProbs?: number[]
        condaEnv?: string | null
        resultsDir?: string | null
      }
    }): Promise<EvolutionRunStartResponse> => {
      return request<EvolutionRunStartResponse>('/evolution/run/start', {
        method: 'POST',
        body: JSON.stringify(params)
      })
    },
    getEvolutionRunStatus: async (runId: string): Promise<EvolutionRunStatusResponse> => {
      return request<EvolutionRunStatusResponse>(`/evolution/run/${runId}/status`)
    }
  },
  snapshots: {
    list: async (sessionId?: string | null): Promise<Snapshot[]> => {
      const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
      return request<Snapshot[]>(`/snapshots${query}`)
    },
    create: async (snapshot: Omit<Snapshot, 'id' | 'created_date'>): Promise<Snapshot> => {
      const data = await request<{ snapshot: Snapshot }>('/snapshots', {
        method: 'POST',
        body: JSON.stringify(snapshot)
      })
      return data.snapshot
    },
    delete: async (id: string): Promise<void> => {
      await request(`/snapshots/${id}`, { method: 'DELETE' })
    }
  }
}
