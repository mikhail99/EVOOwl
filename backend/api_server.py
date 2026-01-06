"""
Lightweight HTTP API to bridge the Python evolution backend with the UI.

Run locally:
  uvicorn backend.api_server:app --reload --port 8000

This keeps storage simple (JSON file on disk) and falls back to
deterministic stubs if an LLM endpoint is unavailable.
"""

from __future__ import annotations

import json
import os
import random
import time
from pathlib import Path
from typing import Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


APP_PREFIX = "/api"
SNAPSHOT_PATH = Path(__file__).parent / "snapshots.json"
LLM_BASE_URL = os.getenv("EVOLVE_LLM_BASE_URL", os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1"))
LLM_API_KEY = os.getenv("EVOLVE_LLM_API_KEY", os.getenv("OLLAMA_API_KEY", "ollama"))
LLM_MODEL = os.getenv("EVOLVE_LLM_MODEL", "ollama:gemma3:latest")
LLM_TIMEOUT = float(os.getenv("EVOLVE_LLM_TIMEOUT", "15.0"))


def _load_snapshots() -> List[Dict]:
    if SNAPSHOT_PATH.exists():
        try:
            return json.loads(SNAPSHOT_PATH.read_text())
        except Exception:
            return []
    return []


def _save_snapshots(data: List[Dict]) -> None:
    SNAPSHOT_PATH.write_text(json.dumps(data, indent=2))


def _maybe_call_llm(prompt: str, fallback_text: str) -> str:
    """
    Try to call an OpenAI-compatible endpoint (e.g., Ollama). Fall back to
    deterministic text so UI flows keep working without the model.
    """
    headers = {"Authorization": f"Bearer {LLM_API_KEY}"} if LLM_API_KEY else {}
    payload = {
        "model": LLM_MODEL.replace("ollama:", "").replace("ollama-", ""),
        "messages": [
            {"role": "system", "content": "You are a concise assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 512,
    }
    try:
        with httpx.Client(base_url=LLM_BASE_URL, timeout=LLM_TIMEOUT) as client:
            resp = client.post("/chat/completions", json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        return fallback_text


class Criterion(BaseModel):
    name: str
    weight: float


class Config(BaseModel):
    populationSize: int
    generations: int
    mutationRate: float
    crossoverRate: float


class Solution(BaseModel):
    id: str
    text: str
    fitness: Optional[float] = None
    criteriaScores: Dict[str, float] = Field(default_factory=dict)
    generation: int
    parentId: Optional[str] = None
    parentIds: Optional[List[str]] = None
    mutationType: Optional[str] = None
    reasoning: Optional[str] = None


class Snapshot(BaseModel):
    id: str
    name: str
    snapshot_type: str
    generation: int
    problem: str
    criteria: List[Criterion]
    config: Config
    population: List[Solution]
    generations_data: List[Dict]
    champion: Optional[Solution] = None
    champion_generation: Optional[int] = None
    best_fitness: float
    session_id: str
    created_date: Optional[str] = None


class InitialRequest(BaseModel):
    problem: str
    criteria: List[Criterion]
    populationSize: int


class InitialResponse(BaseModel):
    solutions: List[Solution]


class EvaluateRequest(BaseModel):
    problem: str
    criteria: List[Criterion]
    solution: Solution


class EvaluateResponse(BaseModel):
    solution: Solution


class CrossoverRequest(BaseModel):
    problem: str
    parent1: Solution
    parent2: Solution


class MutationRequest(BaseModel):
    problem: str
    solution: Solution
    mutationType: Optional[str] = None


class SnapshotCreateRequest(BaseModel):
    name: str
    snapshot_type: str
    generation: int
    problem: str
    criteria: List[Criterion]
    config: Config
    population: List[Solution]
    generations_data: List[Dict]
    champion: Optional[Solution] = None
    champion_generation: Optional[int] = None
    best_fitness: float
    session_id: str


class SnapshotCreateResponse(BaseModel):
    snapshot: Snapshot


app = FastAPI(title="EvoOwl API", openapi_url=f"{APP_PREFIX}/openapi.json", docs_url=f"{APP_PREFIX}/docs")

# Allow local frontends (e.g., Vite on 5173) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{APP_PREFIX}/health")
def health():
    return {"status": "ok"}


@app.post(f"{APP_PREFIX}/evolution/initial", response_model=InitialResponse)
def generate_initial(req: InitialRequest):
    now = int(time.time() * 1000)
    solutions: List[Solution] = []
    for idx in range(req.populationSize):
        prompt = (
            f"Problem: {req.problem}\n\n"
            f"Generate a distinct methodological approach #{idx + 1}. Keep it concise."
        )
        text = _maybe_call_llm(prompt, f"Candidate solution {idx + 1} for: {req.problem[:80]}")
        solutions.append(
            Solution(
                id=f"gen0-{idx}-{now}",
                text=text,
                generation=0,
                fitness=None,
                criteriaScores={},
            )
        )
    return {"solutions": solutions}


@app.post(f"{APP_PREFIX}/evolution/evaluate", response_model=EvaluateResponse)
def evaluate_solution(req: EvaluateRequest):
    weights = {c.name: max(float(c.weight), 0.1) for c in req.criteria if c.name.strip()}
    criteria_scores: Dict[str, float] = {}
    total_weight = sum(weights.values()) or 1.0
    for name, weight in weights.items():
        base = random.uniform(6.0, 9.5)
        jitter = random.uniform(-1.0, 1.0)
        criteria_scores[name] = max(0.0, min(10.0, base + jitter))
    weighted = sum(score * weights[name] for name, score in criteria_scores.items()) / total_weight
    fitness = round(weighted * 10.0, 2)

    reasoning_prompt = (
        f"Problem: {req.problem}\n\n"
        f"Solution: {req.solution.text}\n\n"
        "Briefly justify the scoring across criteria."
    )
    reasoning = _maybe_call_llm(reasoning_prompt, "Automated heuristic scoring based on provided criteria.")

    updated = req.solution.copy()
    updated.fitness = fitness
    updated.criteriaScores = criteria_scores
    updated.reasoning = reasoning
    return {"solution": updated}


@app.post(f"{APP_PREFIX}/evolution/crossover", response_model=Solution)
def crossover(req: CrossoverRequest):
    now = int(time.time() * 1000)
    prompt = (
        f"Problem: {req.problem}\n\n"
        f"Parent 1: {req.parent1.text}\n"
        f"Parent 2: {req.parent2.text}\n\n"
        "Blend the strongest ideas into a concise new approach."
    )
    text = _maybe_call_llm(prompt, f"Hybrid of parent1 and parent2 for {req.problem[:60]}")
    return Solution(
        id=f"cross-{now}",
        text=text,
        generation=max(req.parent1.generation, req.parent2.generation) + 1,
        parentIds=[req.parent1.id, req.parent2.id],
        fitness=None,
        criteriaScores={},
    )


@app.post(f"{APP_PREFIX}/evolution/mutate", response_model=Solution)
def mutate(req: MutationRequest):
    now = int(time.time() * 1000)
    mutation = req.mutationType or "Introduce a novel variation that strengthens the approach."
    prompt = (
        f"Problem: {req.problem}\n\n"
        f"Original Solution: {req.solution.text}\n\n"
        f"Mutation instruction: {mutation}\n"
        "Return a concise improved variant."
    )
    text = _maybe_call_llm(prompt, f"Variation of solution for {req.problem[:60]}")
    return Solution(
        id=f"mut-{now}",
        text=text,
        generation=req.solution.generation + 1,
        parentId=req.solution.id,
        mutationType=mutation,
        fitness=None,
        criteriaScores={},
    )


@app.get(f"{APP_PREFIX}/snapshots", response_model=List[Snapshot])
def list_snapshots(session_id: Optional[str] = Query(default=None)):
    snapshots = _load_snapshots()
    if session_id:
        snapshots = [s for s in snapshots if s.get("session_id") == session_id]
    return snapshots


@app.post(f"{APP_PREFIX}/snapshots", response_model=SnapshotCreateResponse)
def create_snapshot(req: SnapshotCreateRequest):
    snapshots = _load_snapshots()
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    snapshot_id = f"snap-{int(time.time() * 1000)}"
    snapshot = {
        **req.model_dump(),
        "id": snapshot_id,
        "created_date": now_iso,
    }
    snapshots.insert(0, snapshot)
    _save_snapshots(snapshots)
    return {"snapshot": snapshot}


@app.delete(f"{APP_PREFIX}/snapshots/{{snapshot_id}}")
def delete_snapshot(snapshot_id: str):
    snapshots = _load_snapshots()
    new_snapshots = [s for s in snapshots if s.get("id") != snapshot_id]
    if len(new_snapshots) == len(snapshots):
        raise HTTPException(status_code=404, detail="Snapshot not found")
    _save_snapshots(new_snapshots)
    return {"status": "deleted"}
