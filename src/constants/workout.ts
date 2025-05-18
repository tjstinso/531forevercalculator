import type { Set, StandardSet, AmrapSet, RepRangeSet, Template } from '../types/workout';

// Main work sets for each week - Traditional 5/3/1
export const TRADITIONAL_531_MAIN_WORK: Template = {
  week1: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week2: {
    mainSets: [
      { type: 'standard', reps: 3, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.90 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week3: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 1, percentage: 0.95 } as StandardSet,
    ],
    supplementalSets: [],
  },
};

// Main work sets for each week - Traditional 3/5/1
export const TRADITIONAL_351_MAIN_WORK: Template = {
  week1: {
    mainSets: [
      { type: 'standard', reps: 3, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.90 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week2: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week3: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 1, percentage: 0.95 } as StandardSet,
    ],
    supplementalSets: [],
  },
};

// Main work sets for each week - 5s PRO
export const FIVE_PRO_MAIN_WORK: Template = {
  week1: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week2: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.90 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week3: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.95 } as StandardSet,
    ],
    supplementalSets: [],
  },
};

// Main work sets for each week - 5s PRO (3/5/1)
export const FIVE_PRO_351_MAIN_WORK: Template = {
  week1: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.90 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week2: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
    supplementalSets: [],
  },
  week3: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.95 } as StandardSet,
    ],
    supplementalSets: [],
  },
};

// 7th Week Protocol Templates
export const SEVENTH_WEEK_TEMPLATES = {
  deload: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.40 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.50 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.60 } as StandardSet,
    ],
    supplementalSets: [] as Set[], // No supplemental work during deload
  },
  tm_test: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.90 } as StandardSet,
      { type: 'rep_range', minReps: 3, maxReps: 5, percentage: 1.00 } as RepRangeSet,
    ],
    supplementalSets: [] as Set[], // No supplemental work during TM test
  },
  pr_test: {
    mainSets: [
      { type: 'standard', reps: 5, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.90 } as StandardSet,
      { type: 'amrap', percentage: 1.00 } as AmrapSet,
    ],
    supplementalSets: [] as Set[], // No supplemental work during PR test
  },
};

export const MAIN_LIFTS = ['Squat', 'Bench Press', 'Deadlift', 'Press'] as const; 