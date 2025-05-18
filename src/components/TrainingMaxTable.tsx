import React from 'react';
import type { TrainingBlock } from '@/types/workout';

interface TrainingMaxTableProps {
  trainingBlock: TrainingBlock;
}

export function TrainingMaxTable({ trainingBlock }: TrainingMaxTableProps) {
  // Get exercises from the first week of the first leader cycle
  const exercises = trainingBlock.leaderCycles[0].weeks[0].exercises;

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
              Metric
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
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              Training Max
            </td>
            {exercises.map((exercise) => (
              <td key={exercise.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {exercise.trainingMax} lbs
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
} 