import type { Set } from '@/types/workout';

export function formatWeight(weight: number): number {
  // Round down to nearest 5 lbs
  return Math.floor(weight / 5) * 5;
}

export function formatSet(set: Set, trainingMax: number, includePercentage: boolean = true): string {
  const weight = set.weight;
  const percentageStr = includePercentage ? ` (${Math.round(set.percentage * 100)}%)` : '';
  
  switch (set.type) {
    case 'standard':
      return `${set.reps}×${weight} lbs${percentageStr}`;
    case 'amrap':
      return `AMRAP×${weight} lbs${percentageStr}`;
    case 'rep_range':
      return `${set.minReps}-${set.maxReps}×${weight} lbs${percentageStr}`;
  }
} 