/** Deterministic small PRNG so a re-run produces the same clusters and anomalies. */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Standardized = {
  points: number[][];
  means: number[];
  deviations: number[];
};

/** Z-scores each column so a large amount doesn't drown out a small but telling feature. */
export function standardize(points: number[][]): Standardized {
  const dims = points[0]?.length ?? 0;
  const count = points.length || 1;
  const means: number[] = [];
  const deviations: number[] = [];
  for (let d = 0; d < dims; d++) {
    const mean = points.reduce((total, point) => total + (point[d] ?? 0), 0) / count;
    const variance = points.reduce((total, point) => total + ((point[d] ?? 0) - mean) ** 2, 0) / count;
    means.push(mean);
    deviations.push(Math.sqrt(variance) || 1);
  }
  return {
    points: points.map((point) => point.map((value, d) => ((value ?? 0) - (means[d] ?? 0)) / (deviations[d] ?? 1))),
    means,
    deviations,
  };
}

type Node =
  | { kind: "external"; size: number }
  | { kind: "split"; feature: number; value: number; left: Node; right: Node };

function harmonic(n: number): number {
  if (n <= 1) return 0;
  return Math.log(n - 1) + 0.5772156649;
}

const averagePath = (n: number) => (n <= 1 ? 0 : 2 * harmonic(n) - (2 * (n - 1)) / n);

function buildTree(points: number[][], depth: number, maxDepth: number, random: () => number): Node {
  if (depth >= maxDepth || points.length <= 1) return { kind: "external", size: points.length };
  const dims = points[0]?.length ?? 0;
  const candidates: number[] = [];
  for (let d = 0; d < dims; d++) {
    let min = Infinity;
    let max = -Infinity;
    for (const point of points) {
      min = Math.min(min, point[d] ?? 0);
      max = Math.max(max, point[d] ?? 0);
    }
    if (max > min) candidates.push(d);
  }
  if (candidates.length === 0) return { kind: "external", size: points.length };
  const feature = candidates[Math.floor(random() * candidates.length)] ?? 0;
  let min = Infinity;
  let max = -Infinity;
  for (const point of points) {
    min = Math.min(min, point[feature] ?? 0);
    max = Math.max(max, point[feature] ?? 0);
  }
  const value = min + random() * (max - min);
  const left: number[][] = [];
  const right: number[][] = [];
  for (const point of points) ((point[feature] ?? 0) < value ? left : right).push(point);
  if (left.length === 0 || right.length === 0) return { kind: "external", size: points.length };
  return {
    kind: "split",
    feature,
    value,
    left: buildTree(left, depth + 1, maxDepth, random),
    right: buildTree(right, depth + 1, maxDepth, random),
  };
}

function pathLength(node: Node, point: number[], depth = 0): number {
  if (node.kind === "external") return depth + averagePath(node.size);
  return pathLength((point[node.feature] ?? 0) < node.value ? node.left : node.right, point, depth + 1);
}

export type IsolationResult = {
  /** Anomaly score per input point, 0–1; higher means more unusual. */
  scores: number[];
  /** Indexes at or above the threshold, most unusual first. */
  anomalies: number[];
  threshold: number;
};

/**
 * A compact Isolation Forest: many random binary splits over a sample, with
 * points that end up in short branches scored as unusual. It is deliberately
 * simple (no external ML runtime) and deterministic for a given seed.
 */
export function isolationForest(
  points: number[][],
  options: { trees?: number; sampleSize?: number; seed?: number; threshold?: number } = {},
): IsolationResult {
  const count = points.length;
  const threshold = options.threshold ?? 0.62;
  if (count === 0) return { scores: [], anomalies: [], threshold };
  if (count <= 3) return { scores: points.map(() => 0), anomalies: [], threshold };

  const trees = Math.max(10, options.trees ?? 100);
  const sampleSize = Math.max(2, Math.min(options.sampleSize ?? 64, count));
  const maxDepth = Math.ceil(Math.log2(sampleSize)) + 2;
  const random = mulberry32(options.seed ?? 42);
  const scores = new Array<number>(count).fill(0);

  for (let tree = 0; tree < trees; tree++) {
    const indexes = Array.from({ length: count }, (_, index) => index);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const swap = indexes[j] ?? 0;
      indexes[j] = indexes[i] ?? 0;
      indexes[i] = swap;
    }
    const sample = indexes.slice(0, sampleSize).map((index) => points[index] ?? []);
    const root = buildTree(sample, 0, maxDepth, random);
    const divisor = averagePath(sampleSize) || 1;
    for (let i = 0; i < count; i++) {
      scores[i] = (scores[i] ?? 0) + 2 ** (-pathLength(root, points[i] ?? []) / divisor);
    }
  }

  for (let i = 0; i < count; i++) scores[i] = (scores[i] ?? 0) / trees;
  const anomalies = scores
    .map((score, index) => ({ score, index }))
    .filter((entry) => entry.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.index);
  return { scores, anomalies, threshold };
}

export type KMeansResult = {
  assignments: number[];
  centroids: number[][];
  /** Sum of squared distances to each point's centroid; lower is tighter. */
  inertia: number;
  iterations: number;
};

function distanceSquared(a: number[], b: number[]): number {
  let total = 0;
  for (let d = 0; d < a.length; d++) total += ((a[d] ?? 0) - (b[d] ?? 0)) ** 2;
  return total;
}

/**
 * K-Means with k-means++ seeding. Give it standardized points (see
 * `standardize`) when the columns live on different scales.
 */
export function kMeans(points: number[][], k: number, options: { seed?: number; maxIterations?: number } = {}): KMeansResult {
  const count = points.length;
  const dims = points[0]?.length ?? 0;
  const clusters = Math.max(1, Math.min(Math.round(k), count || 1));
  if (count === 0) return { assignments: [], centroids: [], inertia: 0, iterations: 0 };
  const random = mulberry32(options.seed ?? 7);

  // k-means++: spread the first centroids out instead of picking neighbours.
  const centroids: number[][] = [points[Math.floor(random() * count)]?.slice() ?? []];
  while (centroids.length < clusters) {
    const weights = points.map((point) => Math.min(...centroids.map((centroid) => distanceSquared(point, centroid))));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (total <= 0) {
      centroids.push(points[Math.floor(random() * count)]?.slice() ?? []);
      continue;
    }
    let target = random() * total;
    let chosen = 0;
    for (let i = 0; i < count; i++) {
      target -= weights[i] ?? 0;
      if (target <= 0) {
        chosen = i;
        break;
      }
    }
    centroids.push(points[chosen]?.slice() ?? []);
  }

  const assignments = new Array<number>(count).fill(0);
  let iterations = 0;
  const maxIterations = options.maxIterations ?? 60;
  for (; iterations < maxIterations; iterations++) {
    let moved = false;
    for (let i = 0; i < count; i++) {
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = distanceSquared(points[i] ?? [], centroids[c] ?? []);
        if (d < bestDistance) {
          bestDistance = d;
          best = c;
        }
      }
      if (assignments[i] !== best) {
        assignments[i] = best;
        moved = true;
      }
    }
    const sums = Array.from({ length: centroids.length }, () => new Array<number>(dims).fill(0));
    const counts = new Array<number>(centroids.length).fill(0);
    for (let i = 0; i < count; i++) {
      const cluster = assignments[i] ?? 0;
      counts[cluster] = (counts[cluster] ?? 0) + 1;
      const row = sums[cluster];
      if (row) for (let d = 0; d < dims; d++) row[d] = (row[d] ?? 0) + (points[i]?.[d] ?? 0);
    }
    for (let c = 0; c < centroids.length; c++) {
      if (counts[c] === 0) {
        // Re-seed an empty cluster on the point farthest from its centroid.
        let farthest = 0;
        let farthestDistance = -1;
        for (let i = 0; i < count; i++) {
          const d = distanceSquared(points[i] ?? [], centroids[assignments[i] ?? 0] ?? []);
          if (d > farthestDistance) {
            farthestDistance = d;
            farthest = i;
          }
        }
        centroids[c] = points[farthest]?.slice() ?? [];
      } else {
        centroids[c] = (sums[c] ?? []).map((value) => value / (counts[c] ?? 1));
      }
    }
    if (!moved) break;
  }

  let inertia = 0;
  for (let i = 0; i < count; i++) inertia += distanceSquared(points[i] ?? [], centroids[assignments[i] ?? 0] ?? []);
  return { assignments, centroids, inertia: Math.round(inertia * 1000) / 1000, iterations };
}
