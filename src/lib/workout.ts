import type {
  MainLift,
  ExerciseConfig,
  Exercise,
  Cycle,
  Week,
  WeekType,
  ProgressionType,
  TemplateType,
  SeventhWeek,
  SeventhWeekType,
  TrainingBlock,
  TrainingBlockConfig,
  WeekProgression,
  SupplementalTemplateType,
  Set,
  Template,
  LiftInputType
} from '../types/workout';

import {
  TRADITIONAL_531_MAIN_WORK,
  TRADITIONAL_351_MAIN_WORK,
  FIVE_PRO_MAIN_WORK,
  FIVE_PRO_351_MAIN_WORK,
  SEVENTH_WEEK_TEMPLATES,
  MAIN_LIFTS
} from '../constants/workout';

// Helper to round weight to nearest 5 lbs
const roundWeight = (weight: number): number => {
  return Math.floor(weight / 5) * 5;
};

// Helper to determine training max increment based on lift type
const getTrainingMaxIncrement = (liftName: MainLift): number => {
  // Upper body lifts increase by 5, lower body by 10
  return liftName === 'Press' || liftName === 'Bench Press' ? 5 : 10;
};

// Helper to calculate training max
const calculateTrainingMax = (exerciseConfig: ExerciseConfig, inputType: LiftInputType): number => {
  if (inputType === 'tm') {
    return exerciseConfig.inputValue;
  }
  return exerciseConfig.inputValue * exerciseConfig.trainingMaxPercentage;
};

// Helper function to get main work sets based on progression type and week progression
export const getMainWorkSets = (progressionType: ProgressionType, weekProgression: WeekProgression = '5/3/1'): Template => {
  if (progressionType === '5s_pro') {
    return (weekProgression === '3/5/1' ? FIVE_PRO_351_MAIN_WORK : FIVE_PRO_MAIN_WORK) as Template;
  }
  return weekProgression === '3/5/1' ? TRADITIONAL_351_MAIN_WORK : TRADITIONAL_531_MAIN_WORK;
};

// First Set Last (FSL) template generator
export const getFSLTemplate = (progressionType: ProgressionType, templateType: TemplateType): Template => {
  const mainWork = getMainWorkSets(progressionType);
  return {
    week1: {
      mainSets: mainWork.week1.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.65 } as const),
    },
    week2: {
      mainSets: mainWork.week2.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.70 } as const),
    },
    week3: {
      mainSets: mainWork.week3.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.75 } as const),
    },
  };
};

// Second Set Last (SSL) template generator
export const getSSLTemplate = (progressionType: ProgressionType, templateType: TemplateType): Template => {
  const mainWork = getMainWorkSets(progressionType);
  return {
    week1: {
      mainSets: mainWork.week1.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.75 } as const),
    },
    week2: {
      mainSets: mainWork.week2.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.80 } as const),
    },
    week3: {
      mainSets: mainWork.week3.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 5, percentage: 0.85 } as const),
    },
  };
};

// Boring But Big (BBB) template generator
export const getBBBTemplate = (progressionType: ProgressionType, templateType: TemplateType): Template => {
  if (templateType === 'anchor') {
    throw new Error('BBB (Boring But Big) can only be used as a leader template, not as an anchor.');
  }

  const mainWork = getMainWorkSets(progressionType);
  const bbbPercentage = 0.50;
  return {
    week1: {
      mainSets: mainWork.week1.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 10, percentage: bbbPercentage } as const),
    },
    week2: {
      mainSets: mainWork.week2.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 10, percentage: bbbPercentage } as const),
    },
    week3: {
      mainSets: mainWork.week3.mainSets,
      supplementalSets: Array(5).fill({ type: 'standard', reps: 10, percentage: bbbPercentage } as const),
    },
  };
};

// Create a cycle (3 weeks) of training
const createCycle = (
  exercises: ExerciseConfig[],
  progressionType: ProgressionType,
  templateType: TemplateType,
  supplementalTemplate?: SupplementalTemplateType,
  cycleIndex: number = 0,
  weekProgression: WeekProgression = '5/3/1',
  inputType: LiftInputType = '1rm'
): Cycle => {
  const weeks: Week[] = [1, 2, 3].map(weekNumber => {
    const exercisesWithSets = exercises.map(exerciseConfig => {
      // Calculate base training max
      const baseTrainingMax = calculateTrainingMax(exerciseConfig, inputType);

      // Apply progressive overload based on cycle count
      const increment = getTrainingMaxIncrement(exerciseConfig.name) * cycleIndex;
      const trainingMax = baseTrainingMax + increment;

      // Get main work sets based on progression type and week number
      const mainWork = getMainWorkSets(progressionType, weekProgression);
      const weekKey = `week${weekNumber}` as keyof Template;
      
      // Initialize sets with main work and calculate rounded weights
      let sets = [...mainWork[weekKey].mainSets].map(set => ({
        ...set,
        weight: roundWeight(trainingMax * set.percentage)
      }));

      // Add supplemental work if specified
      if (supplementalTemplate) {
        const template = 
          supplementalTemplate === 'FSL' ? getFSLTemplate(progressionType, templateType) :
          supplementalTemplate === 'SSL' ? getSSLTemplate(progressionType, templateType) :
          getBBBTemplate(progressionType, templateType);
        
        const supplementalSets = template[weekKey].supplementalSets.map(set => ({
          ...set,
          weight: roundWeight(trainingMax * set.percentage)
        }));
        
        sets = [...sets, ...supplementalSets];
      }

      return {
        name: exerciseConfig.name,
        sets,
        oneRepMax: inputType === '1rm' ? exerciseConfig.inputValue : exerciseConfig.inputValue / exerciseConfig.trainingMaxPercentage,
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
    templateType,
    weekProgression
  };
};

// Create a seventh week protocol
const createSeventhWeek = (
  exercises: ExerciseConfig[],
  type: SeventhWeekType,
  cycleIndex: number = 0,
  shouldIncrementTM: boolean = false,
  inputType: LiftInputType = '1rm'
): SeventhWeek => {
  const exercisesWithSets = exercises.map(exerciseConfig => {
    // Calculate base training max
    const baseTrainingMax = calculateTrainingMax(exerciseConfig, inputType);

    // Apply progressive overload based on cycle count
    // For TM test, we test the next block's TM by adding one more increment
    const increment = getTrainingMaxIncrement(exerciseConfig.name) * (
      shouldIncrementTM ? cycleIndex + 1 : cycleIndex
    );
    const trainingMax = baseTrainingMax + increment;

    // Get sets from template and calculate rounded weights
    const sets = SEVENTH_WEEK_TEMPLATES[type].mainSets.map(set => ({
      ...set,
      weight: roundWeight(trainingMax * set.percentage)
    }));

    return {
      name: exerciseConfig.name,
      sets,
      oneRepMax: inputType === '1rm' ? exerciseConfig.inputValue : exerciseConfig.inputValue / exerciseConfig.trainingMaxPercentage,
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
        index,
        config.weekProgression,
        config.inputType
      )
    );

  // Create seventh week after leaders using the TM from the last leader cycle
  const seventhWeek = createSeventhWeek(
    config.exercises,
    config.seventhWeekStrategy.afterLeader,
    config.leaderCycles.count - 1,
    false,
    config.inputType
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
        config.leaderCycles.count + index,
        config.weekProgression,
        config.inputType
      )
    );

  // Create final seventh week
  const finalSeventhWeek = createSeventhWeek(
    config.exercises,
    config.seventhWeekStrategy.afterAnchor,
    config.leaderCycles.count + config.anchorCycles.count - 1,
    config.seventhWeekStrategy.afterAnchor === 'tm_test',
    config.inputType
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