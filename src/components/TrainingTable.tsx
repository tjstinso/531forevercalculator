import React from 'react';
import type { TrainingBlock, Set } from '@/types/workout';

interface TrainingTableProps {
  trainingBlock: TrainingBlock;
}

export function TrainingTable({ trainingBlock }: TrainingTableProps) {
  // Get all weeks from the training block in order
  const allWeeks = [
    ...trainingBlock.leaderCycles.flatMap(cycle => cycle.weeks),
    { type: 'seventh_week' as const, exercises: trainingBlock.seventhWeek.exercises },
    ...trainingBlock.anchorCycles.flatMap(cycle => cycle.weeks),
    { type: 'seventh_week' as const, exercises: trainingBlock.finalSeventhWeek.exercises }
  ];

  // Get exercises from the first week
  const exercises = allWeeks[0].exercises;

  function formatSet(set: Set, trainingMax: number): string {
    const weight = Math.floor((trainingMax * set.percentage) / 5) * 5;
    
    switch (set.type) {
      case 'standard':
        return `${set.reps}×${weight} lbs (${Math.round(set.percentage * 100)}%)`;
      case 'amrap':
        return `AMRAP×${weight} lbs (${Math.round(set.percentage * 100)}%)`;
      case 'rep_range':
        return `${set.minReps}-${set.maxReps}×${weight} lbs (${Math.round(set.percentage * 100)}%)`;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {/* Exercise Names Header */}
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              
            </th>
            {exercises.map((exercise) => (
              <th
                key={exercise.name}
                className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {exercise.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Training Max Row */}
          <tr className="bg-gray-50 border-b-2 border-gray-300">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Training Max (lbs)
            </td>
            {exercises.map((exercise) => (
              <td key={exercise.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {exercise.trainingMax} lbs
              </td>
            ))}
          </tr>

          {/* Weekly Schedule Header */}
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Week
            </th>
            {exercises.map((exercise) => (
              <th
                key={exercise.name}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sets
              </th>
            ))}
          </tr>

          {/* Weekly Schedule Rows */}
          {allWeeks.map((week, weekIndex) => (
            <tr key={weekIndex} className="hover:bg-gray-50">
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
              {exercises.map((exercise) => (
                <td key={exercise.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {week.exercises
                    .find(e => e.name === exercise.name)
                    ?.sets.map((set, setIndex) => (
                      <div key={setIndex} className="mb-1 last:mb-0">
                        {formatSet(set, exercise.trainingMax)}
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 