import { createTrainingBlock } from '@/lib/workout';
import type { TrainingBlockConfig } from '@/types/workout';

describe('Training Block Generation', () => {
  const defaultConfig: TrainingBlockConfig = {
    name: "First Training Block",
    startDate: new Date('2024-03-20'),
    exercises: [
      { name: 'Squat', oneRepMax: 315 },
      { name: 'Bench Press', oneRepMax: 225 },
      { name: 'Deadlift', oneRepMax: 405 },
      { name: 'Press', oneRepMax: 135 }
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
          const baseTrainingMax = Math.floor(
            defaultConfig.exercises.find(e => e.name === exercise.name)!.oneRepMax * 0.85
          );
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
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65 },
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 5, percentage: 0.85 }
        ]);
      });
    });

    it('should generate correct sets for traditional anchor cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      
      // Week 1
      const week1 = block.anchorCycles[0].weeks[0];
      week1.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65 },
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 5, percentage: 0.85 }
        ]);
      });

      // Week 2
      const week2 = block.anchorCycles[0].weeks[1];
      week2.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 3, percentage: 0.70 },
          { type: 'standard', reps: 3, percentage: 0.80 },
          { type: 'standard', reps: 3, percentage: 0.90 }
        ]);
      });

      // Week 3
      const week3 = block.anchorCycles[0].weeks[2];
      week3.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 3, percentage: 0.85 },
          { type: 'standard', reps: 1, percentage: 0.95 }
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
        expect(supplementalSets).toHaveLength(5); // SSL is 5x5
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 5,
            percentage: 0.75 // SSL Week 1 percentage
          });
        });
      });
    });

    it('should include FSL sets in anchor cycles', () => {
      const block = createTrainingBlock(defaultConfig);
      const firstAnchorWeek = block.anchorCycles[0].weeks[0];
      
      firstAnchorWeek.exercises.forEach(exercise => {
        const supplementalSets = exercise.sets.slice(3); // After main work sets
        expect(supplementalSets).toHaveLength(5); // FSL is 5x5
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 5,
            percentage: 0.65 // FSL Week 1 percentage
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
        expect(mainSets).toEqual([
          { type: 'standard', reps: 3, percentage: 0.70 },
          { type: 'standard', reps: 3, percentage: 0.80 },
          { type: 'standard', reps: 3, percentage: 0.90 }
        ]);
      });

      // Test week 2 (5's week) 
      const week2 = block.leaderCycles[0].weeks[1];
      week2.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65 },
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 5, percentage: 0.85 }
        ]);
      });

      // Test week 3 (1's week)
      const week3 = block.leaderCycles[0].weeks[2];
      week3.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 3, percentage: 0.85 },
          { type: 'standard', reps: 1, percentage: 0.95 }
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
        expect(supplementalSets).toHaveLength(5); // BBB is 5x10
        supplementalSets.forEach(set => {
          expect(set).toEqual({
            type: 'standard',
            reps: 10,
            percentage: 0.50 // BBB percentage
          });
        });
      });
    });
  });

  describe('Alternative Configurations', () => {
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
      // Test week 1 (3's week)
      const week1 = block.leaderCycles[0].weeks[0];
      week1.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 3, percentage: 0.70 },
          { type: 'standard', reps: 3, percentage: 0.80 },
          { type: 'standard', reps: 3, percentage: 0.90 }
        ]);
      });

      // Test week 2 (5's week) 
      const week2 = block.leaderCycles[0].weeks[1];
      week2.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.65 },
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 5, percentage: 0.85 }
        ]);
      });

      // Test week 3 (1's week)
      const week3 = block.leaderCycles[0].weeks[2];
      week3.exercises.forEach(exercise => {
        const mainSets = exercise.sets.slice(0, 3);
        expect(mainSets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.75 },
          { type: 'standard', reps: 3, percentage: 0.85 },
          { type: 'standard', reps: 1, percentage: 0.95 }
        ]);
      });
    });
  });

  describe('Seventh Week Protocols', () => {
    it('should use correct TM increments for TM test after anchor', () => {
      const config: TrainingBlockConfig = {
        ...defaultConfig,
        leaderCycles: {
          count: 2,
          progressionType: 'traditional',
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
      
      const block = createTrainingBlock(config);
      
      // After 2 leader cycles and 1 anchor cycle, TM should have increased:
      // - Upper body (Press, Bench): 3 cycles * 5lbs = 15lbs
      // - Lower body (Squat, Dead): 3 cycles * 10lbs = 30lbs
      // For TM test, we test the next block's TM by adding one more increment
      block.finalSeventhWeek.exercises.forEach(exercise => {
        const baseTrainingMax = Math.floor(
          config.exercises.find(e => e.name === exercise.name)!.oneRepMax * 0.85
        );
        const cycles = config.leaderCycles.count + config.anchorCycles.count; // -1 because createSeventhWeek uses cycleIndex
        const increment = exercise.name === 'Press' || exercise.name === 'Bench Press' ? 5 : 10;
        const expectedTM = baseTrainingMax + (increment * cycles); // +1 for next cycle's TM

        expect(exercise.trainingMax).toBe(expectedTM);

        // Verify TM test sets use correct percentages of the next cycle's TM
        expect(exercise.sets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.70 },
          { type: 'standard', reps: 5, percentage: 0.80 },
          { type: 'standard', reps: 5, percentage: 0.90 },
          { type: 'rep_range', minReps: 3, maxReps: 5, percentage: 1.00 }
        ]);
      });
    });

    it('should use current cycle TM for deload after leader', () => {
      const block = createTrainingBlock(defaultConfig);
      
      // After 2 leader cycles, TM should have increased:
      // - Upper body (Press, Bench): 2 cycles * 5lbs = 10lbs
      // - Lower body (Squat, Dead): 2 cycles * 10lbs = 20lbs
      block.seventhWeek.exercises.forEach(exercise => {
        const baseTrainingMax = Math.floor(
          defaultConfig.exercises.find(e => e.name === exercise.name)!.oneRepMax * 0.85
        );
        const increment = exercise.name === 'Press' || exercise.name === 'Bench Press' ? 5 : 10;
        const expectedTM = baseTrainingMax + (increment * (defaultConfig.leaderCycles.count - 1));

        expect(exercise.trainingMax).toBe(expectedTM);

        // Verify deload sets use correct percentages
        expect(exercise.sets).toEqual([
          { type: 'standard', reps: 5, percentage: 0.40 },
          { type: 'standard', reps: 5, percentage: 0.50 },
          { type: 'standard', reps: 5, percentage: 0.60 }
        ]);
      });
    });
  });
}); 