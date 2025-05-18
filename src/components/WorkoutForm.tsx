import { useState } from 'react';
import { Label } from '@/components/ui/label';
import type { TrainingBlockConfig } from '@/types/workout';

interface WorkoutFormProps {
  onSubmit: (config: TrainingBlockConfig) => void;
}

export function WorkoutForm({ onSubmit }: WorkoutFormProps) {
  const [formData, setFormData] = useState<Partial<TrainingBlockConfig>>({
    name: 'New Training Block',
    startDate: new Date(),
    exercises: [
      { name: 'Squat', oneRepMax: 315, trainingMaxPercentage: 0.85   },
      { name: 'Bench Press', oneRepMax: 225, trainingMaxPercentage: 0.85 },
      { name: 'Deadlift', oneRepMax: 405, trainingMaxPercentage: 0.85 },
      { name: 'Press', oneRepMax: 135, trainingMaxPercentage: 0.85 }
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formData as TrainingBlockConfig);
    }
  };

  const isFormValid = () => {
    return formData.exercises?.every(exercise => exercise.oneRepMax > 0) &&
           formData.name?.trim() !== '' &&
           formData.startDate;
  };

  const handleExerciseChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises?.map(exercise =>
        exercise.name === name ? { ...exercise, oneRepMax: value } : exercise
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="blockName">Block Name</Label>
          <input
            type="text"
            id="blockName"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate?.toISOString().split('T')[0]}
            onChange={e => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      {/* Main Lifts */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Main Lifts (1RM)</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {formData.exercises?.map(exercise => (
            <div key={exercise.name}>
              <Label htmlFor={exercise.name}>{exercise.name}</Label>
              <input
                type="number"
                id={exercise.name}
                value={exercise.oneRepMax || ''}
                onChange={e => handleExerciseChange(exercise.name, Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="0"
                required
              />
            </div>
          ))}
        </div>
      </div>

      {/* Program Configuration */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Program Configuration</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="weekProgression">Week Progression</Label>
            <select
              id="weekProgression"
              value={formData.weekProgression}
              onChange={e => setFormData(prev => ({ ...prev, weekProgression: e.target.value as '5/3/1' | '3/5/1' }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="5/3/1">5/3/1</option>
              <option value="3/5/1">3/5/1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leader Cycles */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leader Cycles</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <Label>Number of Cycles</Label>
            <div className="flex gap-4 mt-1">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="leaderCount1"
                  name="leaderCount" 
                  value={1}
                  checked={formData.leaderCycles?.count === 1}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    leaderCycles: { ...prev.leaderCycles!, count: 1 }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <Label htmlFor="leaderCount1" className="ml-2">1 Cycle</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="leaderCount2"
                  name="leaderCount"
                  value={2}
                  checked={formData.leaderCycles?.count === 2}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    leaderCycles: { ...prev.leaderCycles!, count: 2 }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <Label htmlFor="leaderCount2" className="ml-2">2 Cycles</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="leaderCount3"
                  name="leaderCount"
                  value={3}
                  checked={formData.leaderCycles?.count === 3}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    leaderCycles: { ...prev.leaderCycles!, count: 3 }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <Label htmlFor="leaderCount3" className="ml-2">3 Cycles</Label>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="leaderProgression">Progression Type</Label>
            <select
              id="leaderProgression"
              value={formData.leaderCycles?.progressionType}
              onChange={e => setFormData(prev => ({
                ...prev,
                leaderCycles: { ...prev.leaderCycles!, progressionType: e.target.value as '5s_pro' | 'traditional' }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="5s_pro">5s PRO</option>
              <option value="traditional">Traditional</option>
            </select>
          </div>
          <div>
            <Label htmlFor="leaderTemplate">Supplemental Template</Label>
            <select
              id="leaderTemplate"
              value={formData.leaderCycles?.supplementalTemplate}
              onChange={e => setFormData(prev => ({
                ...prev,
                leaderCycles: { ...prev.leaderCycles!, supplementalTemplate: e.target.value as 'SSL' | 'BBB' }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="FSL">FSL (First Set Last)</option>
              <option value="SSL">SSL (Second Set Last)</option>
              <option value="BBB">BBB (Boring But Big)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anchor Cycles */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Anchor Cycles</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <Label>Number of Cycles</Label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="anchorCount1"
                  name="anchorCount"
                  value={1}
                  checked={formData.anchorCycles?.count === 1}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    anchorCycles: { ...prev.anchorCycles!, count: 1 }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <Label htmlFor="anchorCount1" className="ml-2">1 Cycle</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="anchorCount2"
                  name="anchorCount"
                  value={2}
                  checked={formData.anchorCycles?.count === 2}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    anchorCycles: { ...prev.anchorCycles!, count: 2 }
                  }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <Label htmlFor="anchorCount2" className="ml-2">2 Cycles</Label>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="anchorProgression">Progression Type</Label>
            <select
              id="anchorProgression"
              value={formData.anchorCycles?.progressionType}
              onChange={e => setFormData(prev => ({
                ...prev,
                anchorCycles: { ...prev.anchorCycles!, progressionType: e.target.value as '5s_pro' | 'traditional' }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="traditional">Traditional</option>
              <option value="5s_pro">5s PRO</option>
            </select>
          </div>
          <div>
            <Label htmlFor="anchorTemplate">Supplemental Template</Label>
            <select
              id="anchorTemplate"
              value={formData.anchorCycles?.supplementalTemplate}
              onChange={e => setFormData(prev => ({
                ...prev,
                anchorCycles: { ...prev.anchorCycles!, supplementalTemplate: e.target.value as 'FSL' }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="FSL">FSL (First Set Last)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={!isFormValid()}
        >
          Generate Training Block
        </button>
      </div>
    </form>
  );
}