import React from 'react';
import type { TrainingBlock, Exercise, Set, Week, Cycle } from '@/types/workout';

interface TrainingBlockTableProps {
  trainingBlock: TrainingBlock;
}

export function TrainingBlockTable({ trainingBlock }: TrainingBlockTableProps) {
  // Get all weeks from the training block in order
  const allWeeks: Week[] = [
    ...trainingBlock.leaderCycles.flatMap(cycle => cycle.weeks),
    { type: 'seventh_week', exercises: trainingBlock.seventhWeek.exercises },
    ...trainingBlock.anchorCycles.flatMap(cycle => cycle.weeks),
    { type: 'seventh_week', exercises: trainingBlock.finalSeventhWeek.exercises }
  ];

  // Get unique exercise names for columns (assuming all weeks have the same exercises)
  const exercises = allWeeks[0].exercises.map(exercise => exercise.name);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed divide-y divide-gray-200">
        <colgroup>
          <col className="w-[200px]" />
          {exercises.map((_, index) => (
            <col key={index} className="w-[200px]" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Week
            </th>
            {exercises.map((exercise) => (
              <th
                key={exercise}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {exercise}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {allWeeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {(() => {
                  // Seventh week
                  if (week.type === 'seventh_week') {
                    if (weekIndex === trainingBlock.leaderCycles.length * 3) {
                      return 'Deload Week';
                    } else {
                      return trainingBlock.finalSeventhWeek.type === 'tm_test' ? 'TM Test Week' : 'Final Deload Week';
                    }
                  }
                  // First week of leader cycles
                  else if (weekIndex < trainingBlock.leaderCycles.length * 3 && weekIndex % 3 === 0) {
                    return `Leader ${Math.floor(weekIndex / 3) + 1} - Week ${weekIndex + 1}`;
                  }
                  // First week of anchor cycles 
                  else if (weekIndex > trainingBlock.leaderCycles.length * 3 && 
                          (weekIndex - (trainingBlock.leaderCycles.length * 3 + 1)) % 3 === 0) {
                    const anchorIndex = Math.floor((weekIndex - (trainingBlock.leaderCycles.length * 3 + 1)) / 3) + 1;
                    return `Anchor ${anchorIndex} - Week ${weekIndex + 1}`;
                  }
                  else {
                    return `Week ${weekIndex + 1}`;
                  }
                })()}
              </td>
              {exercises.map((exerciseName) => {
                const exercise = week.exercises.find(e => e.name === exerciseName);
                return (
                  <td key={exerciseName} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exercise?.sets.map((set, setIndex) => (
                      <div key={setIndex} className="mb-1">
                        {formatSet(set, exercise.trainingMax)}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatSet(set: Set, trainingMax: number): string {
  // should this be configurable? rounding down is always safe except in the case of your ego.
  const weight = Math.floor((trainingMax * set.percentage) / 5) * 5;
  
  switch (set.type) {
    case 'standard':
      return `${set.reps}×${weight}lbs (${Math.round(set.percentage * 100)}%)`;
    case 'amrap':
      return `AMRAP×${weight}lbs (${Math.round(set.percentage * 100)}%)`;
    case 'rep_range':
      return `${set.minReps}-${set.maxReps}×${weight}lbs (${Math.round(set.percentage * 100)}%)`;
  }
} 