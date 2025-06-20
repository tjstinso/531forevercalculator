import { createTrainingBlock } from '@/lib/workout';
import type { StandardSet, TrainingBlockConfig } from '@/types/workout';

describe('Training Block Generation', () => {
  const defaultConfig: TrainingBlockConfig = {
    name: "First Training Block",
    startDate: new Date('2024-03-20'),
    inputType: '1rm',
    exercises: [
      { name: 'Squat', inputValue: 315, trainingMaxPercentage: 0.85 },
      { name: 'Bench Press', inputValue: 225, trainingMaxPercentage: 0.85 },
      { name: 'Deadlift', inputValue: 405, trainingMaxPercentage: 0.85 },
      { name: 'Press', inputValue: 135, trainingMaxPercentage: 0.85 }
    ],
    weekProgression: '5/3/1',
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

  describe('Basic Training Block Structure', () => {
    it('should create a training block with the correct number of cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      
      expect(block.name).toBe(defaultConfig.name);
      expect(block.startDate).toEqual(defaultConfig.startDate);
      expect(block.leaderCycles).toHaveLength(2);
      expect(block.anchorCycles).toHaveLength(1);
    });

    it('should include seventh week protocols between leader and anchor cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      
      expect(block.seventhWeek.type).toBe('deload');
      expect(block.finalSeventhWeek.type).toBe('tm_test');
    });
  });

  describe('Training Max Progression', () => {
    it('should increment training maxes correctly between cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      
      // Check TM progression for each lift
      block.leaderCycles.forEach((cycle, cycleIndex) => {
        cycle.weeks[0].exercises.forEach(exercise => {
          const increment = exercise.name === 'Press' || exercise.name === 'Bench Press' ? 5 : 10;
          const baseTrainingMax = defaultConfig.exercises.find(e => e.name === exercise.name)!.inputValue * 0.85;
          const expectedTM = baseTrainingMax + (increment * cycleIndex);
          expect(exercise.trainingMax).toBe(expectedTM);
        });
      });
    });
  });

  describe('Set Generation', () => {
    it('should generate correct sets for 5s PRO leader cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      const firstLeaderWeek = block.leaderCycles[0].weeks[0];
      
      firstLeaderWeek.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3); // First 3 sets are main work
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65, weight: Math.floor(baseWeight * 0.65 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.75, weight: Math.floor(baseWeight * 0.75 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.85, weight: Math.floor(baseWeight * 0.85 / 5) * 5 }
        ]);
      });
    });

    it('should generate correct sets for traditional anchor cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      
      // Week 1
      const week1 = block.anchorCycles[0].weeks[0];
      week1.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65, weight: Math.floor(baseWeight * 0.65 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.75, weight: Math.floor(baseWeight * 0.75 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.85, weight: Math.floor(baseWeight * 0.85 / 5) * 5 }
        ]);
      });

      // Week 2
      const week2 = block.anchorCycles[0].weeks[1];
      week2.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 3, percentage: 0.70, weight: Math.floor(baseWeight * 0.70 / 5) * 5 },
          { type: 'standard', reps: 3, percentage: 0.80, weight: Math.floor(baseWeight * 0.80 / 5) * 5 },
          { type: 'standard', reps: 3, percentage: 0.90, weight: Math.floor(baseWeight * 0.90 / 5) * 5 }
        ]);
      });

      // Week 3
      const week3 = block.anchorCycles[0].weeks[2];
      week3.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.75, weight: Math.floor(baseWeight * 0.75 / 5) * 5 },
          { type: 'standard', reps: 3, percentage: 0.85, weight: Math.floor(baseWeight * 0.85 / 5) * 5 },
          { type: 'standard', reps: 1, percentage: 0.95, weight: Math.floor(baseWeight * 0.95 / 5) * 5 }
        ]);
      });
    });
  });

  describe('Supplemental Templates', () => {
    it('should include SSL sets in leader cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      const firstLeaderWeek = block.leaderCycles[0].weeks[0];
      
      firstLeaderWeek.exercises.forEach(exercise => {
        const supplementalSets = exercise.sets.slice(3); // After main work sets
        const baseWeight = exercise.trainingMax;
        const expectedWeight = Math.floor(baseWeight * 0.75 / 5) * 5; // SSL Week 1 percentage is 75%
        expect(supplementalSets).toHaveLength(5); // SSL is 5x5
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 5,
            percentage: 0.75, // SSL Week 1 percentage
            weight: expectedWeight
          });
        });
      });
    });

    it('should include FSL sets in anchor cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      const firstAnchorWeek = block.anchorCycles[0].weeks[0];
      
      firstAnchorWeek.exercises.forEach(exercise => {
        const supplementalSets = exercise.sets.slice(3); // After main work sets
        const baseWeight = exercise.trainingMax;
        const expectedWeight = Math.floor(baseWeight * 0.65 / 5) * 5; // FSL Week 1 percentage is 65%
        expect(supplementalSets).toHaveLength(5); // FSL is 5x5
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 5,
            percentage: 0.65, // FSL Week 1 percentage
            weight: expectedWeight
          });
        });
      });
    });
  });

  describe('Alternative Configurations', () => {
    it('should handle 3/5/1 week progression', () => {
      const config: TrainingBlockConfig = {
        ...defaultConfig,
        weekProgression: '3/5/1',
        leaderCycles: {
          ...defaultConfig.leaderCycles,
          progressionType: 'traditional'  // Ensure we're using traditional progression
        }
      };
      const block = createTrainingBlock(config);
      
      // Test week 1 (3's week)
      const week1 = block.leaderCycles[0].weeks[0];
      week1.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 3, percentage: 0.70, weight: Math.floor(baseWeight * 0.70 / 5) * 5 },
          { type: 'standard', reps: 3, percentage: 0.80, weight: Math.floor(baseWeight * 0.80 / 5) * 5 },
          { type: 'standard', reps: 3, percentage: 0.90, weight: Math.floor(baseWeight * 0.90 / 5) * 5 }
        ]);
      });
    });

    it('should handle BBB supplemental template', () => {
      const config: TrainingBlockConfig = {
        ...defaultConfig,
        leaderCycles: {
          ...defaultConfig.leaderCycles,
          supplementalTemplate: 'BBB'
        }
      };
      const block = createTrainingBlock(config);
      const firstWeek = block.leaderCycles[0].weeks[0];
      
      firstWeek.exercises.forEach(exercise => {
        const supplementalSets = exercise.sets.slice(3);
        const baseWeight = exercise.trainingMax;
        const expectedWeight = Math.floor(baseWeight * 0.50 / 5) * 5; // BBB is 50%
        expect(supplementalSets).toHaveLength(5); // BBB is 5x10
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 10,
            percentage: 0.50, // BBB percentage
            weight: expectedWeight
          });
        });
      });
    });

    it('should handle 3/5/1 week progression with 5s_pro', () => {
      const config: TrainingBlockConfig = {
        ...defaultConfig,
        weekProgression: '3/5/1',
        leaderCycles: {
          ...defaultConfig.leaderCycles,
          progressionType: '5s_pro'
        }
      };
      const block = createTrainingBlock(config);
      
      // Test week 1 (3's week converted to 5's by 5s PRO)
      const week1 = block.leaderCycles[0].weeks[0];
      week1.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        const baseWeight = exercise.trainingMax;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.70, weight: Math.floor(baseWeight * 0.70 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.80, weight: Math.floor(baseWeight * 0.80 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.90, weight: Math.floor(baseWeight * 0.90 / 5) * 5 }
        ]);
      });
    });
  });

  describe('Seventh Week Protocols', () => {
    it('should use correct TM increments for TM test after anchor', () => {
      const block = createTrainingBlock(defaultConfig);
      const finalWeek = block.finalSeventhWeek;
      
      finalWeek.exercises.forEach(exercise => {
        const baseTrainingMax = defaultConfig.exercises.find(e => e.name === exercise.name)!.inputValue * 0.85;
        const increment = exercise.name === 'Press' || exercise.name === 'Bench Press' ? 5 : 10;
        const cycles = defaultConfig.leaderCycles.count + defaultConfig.anchorCycles.count;
        const expectedTM = baseTrainingMax + (increment * cycles);

        expect(exercise.trainingMax).toBe(expectedTM);

        // Verify TM test sets use correct percentages of the next cycle's TM
        const mainSets = exercise.sets;
        mainSets.forEach(set => {
          expect((set.weight ?? 0) % 5).toBe(0);
          const expectedWeight = Math.floor((exercise.trainingMax * set.percentage) / 5) * 5;
          expect(set.weight ?? 0).toBe(expectedWeight);
        });

        // First 3 sets are standard sets
        const standardSets = mainSets.slice(0, 3) as StandardSet[];
        expect(standardSets.map(({type, reps, percentage, weight}) => ({type, reps, percentage, weight}))).toEqual([
          { type: 'standard', reps: 5, percentage: 0.70, weight: Math.floor(expectedTM * 0.70 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.80, weight: Math.floor(expectedTM * 0.80 / 5) * 5 },
          { type: 'standard', reps: 5, percentage: 0.90, weight: Math.floor(expectedTM * 0.90 / 5) * 5 }
        ]);

        // Last set is rep range
        const repRangeSet = mainSets[3];
        expect(repRangeSet).toMatchObject({
          type: 'rep_range',
          minReps: 3,
          maxReps: 5,
          percentage: 1.00,
          weight: Math.floor(expectedTM * 1.00 / 5) * 5
        });
      });
    });

    it('should use current cycle TM for deload after leader', () => {
      const block = createTrainingBlock(defaultConfig);
      const seventhWeek = block.seventhWeek;
      
      seventhWeek.exercises.forEach(exercise => {
        const baseTrainingMax = defaultConfig.exercises.find(e => e.name === exercise.name)!.inputValue * 0.85;
        const increment = exercise.name === 'Press' || exercise.name === 'Bench Press' ? 5 : 10;
        const expectedTM = baseTrainingMax + (increment * (defaultConfig.leaderCycles.count - 1));

        expect(exercise.trainingMax).toBe(expectedTM);

        // Verify deload sets use correct percentages
        const mainSets = exercise.sets;
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.70, weight: Math.floor(expectedTM * 0.70 / 5) * 5 },
          { type: 'rep_range', minReps: 3, maxReps: 5, percentage: 0.80, weight: Math.floor(expectedTM * 0.80 / 5) * 5 },
          { type: 'standard', reps: 1, percentage: 0.90, weight: Math.floor(expectedTM * 0.90 / 5) * 5 },
          { type: 'standard', reps: 1, percentage: 1.0, weight: Math.floor(expectedTM / 5) * 5 }
        ]);
      });
    });
  });
}); 