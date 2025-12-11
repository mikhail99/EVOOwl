// Mock implementation of base44Client
// This would typically be a real API client

interface EntityOperations<T> {
  list: (sort?: string, limit?: number) => Promise<T[]>
  create: (data: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
}

interface IntegrationOperations {
  Core: {
    InvokeLLM: (params: {
      prompt: string
      response_json_schema?: any
    }) => Promise<any>
  }
}

interface EvolutionSnapshot {
  id: string
  name: string
  snapshot_type: string
  generation: number
  problem: string
  criteria: any[]
  config: any
  population: any[]
  generations_data: any[]
  champion: any
  champion_generation: number
  best_fitness: number
  session_id: string
  created_date?: string
}

// Mock storage for evolution snapshots
let evolutionSnapshots: EvolutionSnapshot[] = []

const createEntityOperations = <T extends { id: string }>(
  storage: T[]
): EntityOperations<T> => ({
  list: async (sort?: string, limit?: number) => {
    let result = [...storage]

    if (sort) {
      const [field, direction] = sort.split(' ')
      result.sort((a, b) => {
        const aVal = (a as any)[field]
        const bVal = (b as any)[field]
        const modifier = direction === 'desc' ? -1 : 1
        return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0
      })
    }

    if (limit) {
      result = result.slice(0, limit)
    }

    return result
  },

  create: async (data: Partial<T>) => {
    const newItem = {
      ...data,
      id: Math.random().toString(36).substring(2, 15),
      created_date: new Date().toISOString()
    } as T

    storage.push(newItem)
    return newItem
  },

  delete: async (id: string) => {
    const index = storage.findIndex(item => item.id === id)
    if (index !== -1) {
      storage.splice(index, 1)
    }
  }
})

const integrations: IntegrationOperations = {
  Core: {
    InvokeLLM: async (params: { prompt: string; response_json_schema?: any }) => {
      // Mock LLM response - in a real implementation this would call an API
      console.log('Mock LLM call with prompt:', params.prompt)

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 500))

      // Return a mock response based on the prompt content
      if (params.prompt.includes('Generate') && params.prompt.includes('solutions')) {
        return {
          solutions: [
            { text: 'Mock solution 1: A comprehensive approach focusing on systematic analysis and iterative refinement.' },
            { text: 'Mock solution 2: An innovative method combining traditional techniques with modern tools.' },
            { text: 'Mock solution 3: A streamlined process emphasizing efficiency and measurable outcomes.' },
            { text: 'Mock solution 4: A collaborative framework leveraging team expertise and external resources.' },
            { text: 'Mock solution 5: A scalable solution designed for long-term adaptability and growth.' },
            { text: 'Mock solution 6: A creative approach challenging conventional wisdom and exploring new paradigms.' }
          ]
        }
      }

      if (params.prompt.includes('Evaluate this solution')) {
        return {
          scores: {
            'Feasibility': Math.floor(Math.random() * 6) + 5,
            'Innovation': Math.floor(Math.random() * 6) + 5,
            'Clarity': Math.floor(Math.random() * 6) + 5
          },
          overall_fitness: Math.floor(Math.random() * 30) + 70,
          reasoning: 'Mock evaluation reasoning based on the provided criteria.'
        }
      }

      if (params.prompt.includes('Create a new solution by synthesizing')) {
        return {
          text: 'Mock crossover result: A hybrid solution combining the best elements of both parent solutions with enhanced synergy.'
        }
      }

      if (params.prompt.includes('Mutate this solution')) {
        return {
          text: 'Mock mutation result: The original solution with an innovative twist that enhances its effectiveness.'
        }
      }

      // Default response
      return { text: 'Mock LLM response' }
    }
  }
}

export const base44 = {
  entities: {
    EvolutionSnapshot: createEntityOperations<EvolutionSnapshot>(evolutionSnapshots)
  },
  integrations
}
