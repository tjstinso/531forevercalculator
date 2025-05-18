// Base interface for all set types
interface BaseSet {
  percentage: number;
  type: 'standard' | 'amrap' | 'rep_range';
}

// Standard set with fixed reps
interface StandardSet extends BaseSet {
  type: 'standard';
  reps: number;
}

// AMRAP (As Many Reps As Possible) set
interface AmrapSet extends BaseSet {
  type: 'amrap';
}

// Set with a rep range (e.g., 3-5 reps)
interface RepRangeSet extends BaseSet {
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

// A standard 3-week cycle
export type Cycle = {
  weeks: Week[];
  progressionType: ProgressionType;
  templateType: TemplateType;
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

// Main work sets for each week - Traditional 5/3/1
export const TRADITIONAL_MAIN_WORK: {
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
      { type: 'standard', reps: 3, percentage: 0.70 },
      { type: 'standard', reps: 3, percentage: 0.80 },
      { type: 'standard', reps: 3, percentage: 0.90 },
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

// Helper function to get main work sets based on progression type
export const getMainWorkSets = (progressionType: ProgressionType) => {
  return progressionType === 'traditional' ? TRADITIONAL_MAIN_WORK : FIVE_PRO_MAIN_WORK;
};

type WeekTemplate = {
  mainSets: Set[];
  supplementalSets: Set[];
};

type SupplementalTemplate = {
  [key: string]: WeekTemplate;
};

// First Set Last (FSL) template generator
export const getFSLTemplate = (progressionType: ProgressionType, templateType: TemplateType): SupplementalTemplate => {
  const mainWork = getMainWorkSets(progressionType);
  return {
    week1: {
      mainSets: mainWork.week1.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.65 } as StandardSet),
    },
    week2: {
      mainSets: mainWork.week2.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.70 } as StandardSet),
    },
    week3: {
      mainSets: mainWork.week3.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.75 } as StandardSet),
    },
  };
};

// Second Set Last (SSL) template generator
export const getSSLTemplate = (progressionType: ProgressionType, templateType: TemplateType): SupplementalTemplate => {
  const mainWork = getMainWorkSets(progressionType);
  return {
    week1: {
      mainSets: mainWork.week1.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.75 } as StandardSet),
    },
    week2: {
      mainSets: mainWork.week2.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.80 } as StandardSet),
    },
    week3: {
      mainSets: mainWork.week3.sets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.85 } as StandardSet),
    },
  };
};

export const MAIN_LIFTS = ['Squat', 'Bench Press', 'Deadlift', 'Press'] as const;
export type MainLift = typeof MAIN_LIFTS[number];

// Helper to determine training max increment based on lift type
const getTrainingMaxIncrement = (liftName: MainLift): number => {
  // Upper body lifts increase by 5, lower body by 10
  return liftName === 'Press' || liftName === 'Bench Press' ? 5 : 10;
};

// Configuration for creating an exercise
export type ExerciseConfig = {
  name: MainLift;
  oneRepMax: number;
  trainingMaxPercentage?: number; // defaults to 0.85 if not specified
  cycleCount?: number; // tracks how many cycles completed for progressive overload
};

// Configuration for creating a training block
export type TrainingBlockConfig = {
  name: string;
  startDate: Date;
  exercises: ExerciseConfig[];
  leaderCycles: {
    count: 1 | 2;
    progressionType: ProgressionType;
    supplementalTemplate?: 'FSL' | 'SSL';
  };
  anchorCycles: {
    count: 1 | 2;
    progressionType: ProgressionType;
    supplementalTemplate?: 'FSL' | 'SSL';
  };
  seventhWeekStrategy: {
    afterLeader: SeventhWeekType;
    afterAnchor: SeventhWeekType;
  };
};

// Helper to calculate training max
const calculateTrainingMax = (oneRepMax: number, trainingMaxPercentage: number = 0.85): number => {
  return Math.floor(oneRepMax * trainingMaxPercentage);
};

// Create a cycle (3 weeks) of training
const createCycle = (
  exercises: ExerciseConfig[],
  progressionType: ProgressionType,
  templateType: TemplateType,
  supplementalTemplate?: 'FSL' | 'SSL',
  cycleIndex: number = 0
): Cycle => {
  const weeks: Week[] = [1, 2, 3].map(weekNumber => {
    const exercisesWithSets = exercises.map(exerciseConfig => {
      // Calculate base training max
      const baseTrainingMax = calculateTrainingMax(
        exerciseConfig.oneRepMax,
        exerciseConfig.trainingMaxPercentage
      );

      // Apply progressive overload based on cycle count
      const increment = getTrainingMaxIncrement(exerciseConfig.name) * cycleIndex;
      const trainingMax = baseTrainingMax + increment;

      // Get main work sets based on progression type and week number
      const mainWork = getMainWorkSets(progressionType)[`week${weekNumber}`];
      
      // Initialize sets with main work
      let sets = [...mainWork.sets];

      // Add supplemental work if specified
      if (supplementalTemplate) {
        const template = supplementalTemplate === 'FSL' 
          ? getFSLTemplate(progressionType, templateType)
          : getSSLTemplate(progressionType, templateType);
        
        const supplementalSets = template[`week${weekNumber}`].supplementalSets;
        sets = [...sets, ...supplementalSets];
      }

      return {
        name: exerciseConfig.name,
        sets,
        oneRepMax: exerciseConfig.oneRepMax,
        trainingMax
      };
    });

    return {
      exercises: exercisesWithSets,
      type: 'regular' as WeekType
    };
  });

  return {
    weeks,
    progressionType,
    templateType
  };
};

// Create a seventh week protocol
const createSeventhWeek = (
  exercises: ExerciseConfig[],
  type: SeventhWeekType,
  cycleIndex: number = 0,
  shouldIncrementTM: boolean = false // Add flag for TM test specifically
): SeventhWeek => {
  const exercisesWithSets = exercises.map(exerciseConfig => {
    // Calculate base training max
    const baseTrainingMax = calculateTrainingMax(
      exerciseConfig.oneRepMax,
      exerciseConfig.trainingMaxPercentage
    );

    // Apply progressive overload based on cycle count
    // For TM test, we test the next block's TM by adding one more increment
    const increment = getTrainingMaxIncrement(exerciseConfig.name) * (
      shouldIncrementTM ? cycleIndex + 1 : cycleIndex
    );
    const trainingMax = baseTrainingMax + increment;

    return {
      name: exerciseConfig.name,
      sets: SEVENTH_WEEK_TEMPLATES[type].mainSets,
      oneRepMax: exerciseConfig.oneRepMax,
      trainingMax
    };
  });

  return {
    exercises: exercisesWithSets,
    type
  };
};

// Create a complete training block
export const createTrainingBlock = (config: TrainingBlockConfig): TrainingBlock => {
  // Create leader cycles with progressive overload
  const leaderCycles: Cycle[] = Array(config.leaderCycles.count)
    .fill(null)
    .map((_, index) => 
      createCycle(
        config.exercises,
        config.leaderCycles.progressionType,
        'leader',
        config.leaderCycles.supplementalTemplate,
        index
      )
    );

  // Create seventh week after leaders using the TM from the last leader cycle
  const seventhWeek = createSeventhWeek(
    config.exercises,
    config.seventhWeekStrategy.afterLeader,
    config.leaderCycles.count - 1, // Use the index of the last leader cycle
    false // Don't increment TM for deload
  );

  // Create anchor cycles with continued progressive overload
  const anchorCycles: Cycle[] = Array(config.anchorCycles.count)
    .fill(null)
    .map((_, index) =>
      createCycle(
        config.exercises,
        config.anchorCycles.progressionType,
        'anchor',
        config.anchorCycles.supplementalTemplate,
        config.leaderCycles.count + index
      )
    );

  // Create final seventh week
  const finalSeventhWeek = createSeventhWeek(
    config.exercises,
    config.seventhWeekStrategy.afterAnchor,
    config.leaderCycles.count + config.anchorCycles.count - 1, // Current cycle index
    config.seventhWeekStrategy.afterAnchor === 'tm_test' // Increment TM only for TM test
  );

  return {
    name: config.name,
    startDate: config.startDate,
    leaderCycles,
    seventhWeek,
    anchorCycles,
    finalSeventhWeek
  };
};

// Example usage:
/*
const blockConfig: TrainingBlockConfig = {
  name: "First Training Block",
  startDate: new Date(),
  exercises: [
    { name: 'Squat', oneRepMax: 315 },
    { name: 'Bench Press', oneRepMax: 225 },
    { name: 'Deadlift', oneRepMax: 405 },
    { name: 'Press', oneRepMax: 135 }
  ],
  leaderCycles: {
    count: 2,
    progressionType: '5s_pro',
    supplementalTemplate: 'SSL'
  },
  anchorCycles: {
    count: 1,
    progressionType: 'traditional',
    supplementalTemplate: 'FSL'
  },
  seventhWeekStrategy: {
    afterLeader: 'deload',
    afterAnchor: 'tm_test'
  }
};

const trainingBlock = createTrainingBlock(blockConfig);
*/