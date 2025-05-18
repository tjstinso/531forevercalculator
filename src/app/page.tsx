'use client';

import { WorkoutForm } from '@/components/WorkoutForm';
import { TrainingTable } from '@/components/TrainingTable';
import { useState } from 'react';
import type { TrainingBlockConfig } from '@/types/workout';
import { createTrainingBlock } from '@/lib/workout';
import { formatSet } from '@/utils/format';

export default function Home() {
  const [trainingBlock, setTrainingBlock] = useState<ReturnType<typeof createTrainingBlock> | null>(null);

  const handleFormSubmit = (config: TrainingBlockConfig) => {
    const block = createTrainingBlock(config);
    setTrainingBlock(block);
  };

  const handleExportCSV = () => {
    if (!trainingBlock) return;

    // Create CSV content
    const rows = [
      ['Week', 'Type', 'Exercise', 'Training Max', 'Sets'],
    ];

    // Add leader cycles
    trainingBlock.leaderCycles.forEach((cycle, cycleIndex) => {
      cycle.weeks.forEach((week, weekIndex) => {
        week.exercises.forEach(exercise => {
          rows.push([
            `Week ${cycleIndex * 3 + weekIndex + 1}`,
            `Leader ${cycleIndex + 1} - Week ${weekIndex + 1}`,
            exercise.name,
            `${exercise.trainingMax} lbs`,
            exercise.sets.map(set => formatSet(set, exercise.trainingMax, false)).join(', ')
          ]);
        });
      });
    });

    // Add seventh week
    trainingBlock.seventhWeek.exercises.forEach(exercise => {
      rows.push([
        'Deload Week',
        'Deload',
        exercise.name,
        `${exercise.trainingMax} lbs`,
        exercise.sets.map(set => formatSet(set, exercise.trainingMax, false)).join(', ')
      ]);
    });

    // Add anchor cycles
    trainingBlock.anchorCycles.forEach((cycle, cycleIndex) => {
      cycle.weeks.forEach((week, weekIndex) => {
        week.exercises.forEach(exercise => {
          rows.push([
            `Week ${(trainingBlock.leaderCycles.length * 3) + 1 + cycleIndex * 3 + weekIndex}`,
            `Anchor ${cycleIndex + 1} - Week ${weekIndex + 1}`,
            exercise.name,
            `${exercise.trainingMax} lbs`,
            exercise.sets.map(set => formatSet(set, exercise.trainingMax, false)).join(', ')
          ]);
        });
      });
    });

    // Add final seventh week
    trainingBlock.finalSeventhWeek.exercises.forEach(exercise => {
      rows.push([
        'Final Week',
        trainingBlock.finalSeventhWeek.type === 'tm_test' ? 'TM Test' : 'Deload',
        exercise.name,
        `${exercise.trainingMax} lbs`,
        exercise.sets.map(set => formatSet(set, exercise.trainingMax, false)).join(', ')
      ]);
    });

    // Convert to CSV string
    const csvContent = rows.map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `531_Workout_Plan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Your Training Block</h2>
        <WorkoutForm onSubmit={handleFormSubmit} />
      </section>

      {trainingBlock && (
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Training Block Plan</h2>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export to CSV
            </button>
          </div>
          <TrainingTable trainingBlock={trainingBlock} />
        </section>
      )}
    </div>
  );
}