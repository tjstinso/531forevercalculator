// Base interface for all set types
export interface BaseSet {
  percentage: number;
  type: 'standard' | 'amrap' | 'rep_range';
}

// Standard set with fixed reps
export interface StandardSet extends BaseSet {
  type: 'standard';
  reps: number;
}

// AMRAP (As Many Reps As Possible) set
export interface AmrapSet extends BaseSet {
  type: 'amrap';
}

// Set with a rep range (e.g., 3-5 reps)
export interface RepRangeSet extends BaseSet {
  type: 'rep_range';
  minReps: number;
  maxReps: number;
}

export type Set = StandardSet | AmrapSet | RepRangeSet;

export type Exercise = {
  name: string;
  sets: Set[];
  oneRepMax: number;
  trainingMax: number;
};

export type WeekType = 'regular' | 'seventh_week';
export type ProgressionType = 'traditional' | '5s_pro';
export type TemplateType = 'leader' | 'anchor';
export type SeventhWeekType = 'deload' | 'tm_test' | 'pr_test';
export type WeekProgression = '5/3/1' | '3/5/1';
export type SupplementalTemplateType = 'FSL' | 'SSL' | 'BBB';

// A standard 3-week cycle
export type Cycle = {
  weeks: Week[];
  progressionType: ProgressionType;
  templateType: TemplateType;
  weekProgression: WeekProgression;
};

export type Week = {
  exercises: Exercise[];
  type: WeekType;
};

// The 7th week protocol that occurs between leader/anchor transitions
export type SeventhWeek = {
  exercises: Exercise[];
  type: SeventhWeekType;
};

// A complete training block consists of:
// 1-2 leader cycles -> 7th week protocol -> 1-2 anchor cycles -> 7th week protocol
export type TrainingBlock = {
  name: string;
  startDate: Date;
  leaderCycles: Cycle[];
  seventhWeek: SeventhWeek;
  anchorCycles: Cycle[];
  finalSeventhWeek: SeventhWeek;
};

export type MainLift = 'Squat' | 'Bench Press' | 'Deadlift' | 'Press';

export type ExerciseConfig = {
  name: MainLift;
  oneRepMax: number;
  trainingMaxPercentage: number; // defaults to 0.85 if not specified
  cycleCount?: number; // tracks how many cycles completed for progressive overload
};

export type TrainingBlockConfig = {
  name: string;
  startDate: Date;
  exercises: ExerciseConfig[];
  weekProgression: WeekProgression;
  leaderCycles: {
    count: 1 | 2 | 3;
    progressionType: ProgressionType;
    supplementalTemplate?: SupplementalTemplateType;
  };
  anchorCycles: {
    count: 1 | 2;
    progressionType: ProgressionType;
    supplementalTemplate?: SupplementalTemplateType;
  };
  seventhWeekStrategy: {
    afterLeader: SeventhWeekType;
    afterAnchor: SeventhWeekType;
  };
};

export interface TemplateWeek {
  mainSets: Set[];
  supplementalSets: Set[];
}

export interface Template {
  week1: TemplateWeek;
  week2: TemplateWeek;
  week3: TemplateWeek;
}

// Main work sets for each week - Traditional 5/3/1
export const TRADITIONAL_531_MAIN_WORK: {
  [key: string]: { sets: Set[] }
} = {
  week1: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
  },
  week2: {
    sets: [
      { type: 'standard', reps: 3, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.90 } as StandardSet,
    ],
  },
  week3: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 1, percentage: 0.95 } as StandardSet,
    ],
  },
};

// Main work sets for each week - Traditional 3/5/1
export const TRADITIONAL_351_MAIN_WORK: {
  [key: string]: { sets: Set[] }
} = {
  week1: {
    sets: [
      { type: 'standard', reps: 3, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.90 } as StandardSet,
    ],
  },
  week2: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
  },
  week3: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 3, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 1, percentage: 0.95 } as StandardSet,
    ],
  },
};

// Main work sets for each week - 5s PRO
export const FIVE_PRO_MAIN_WORK: {
  [key: string]: { sets: Set[] }
} = {
  week1: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.65 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
    ],
  },
  week2: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.70 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.80 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.90 } as StandardSet,
    ],
  },
  week3: {
    sets: [
      { type: 'standard', reps: 5, percentage: 0.75 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.85 } as StandardSet,
      { type: 'standard', reps: 5, percentage: 0.95 } as StandardSet,
    ],
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