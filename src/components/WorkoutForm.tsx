import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import type { TrainingBlockConfig, LiftInputType } from '@/types/workout';
import { TokenResponse } from '@react-oauth/google';
import { SPREADSHEET_IDENTIFIER } from '@/constants/workout';
import { Credentials } from '@/types/auth';

interface Spreadsheet {
  id: string;
  name: string;
  createdTime: string;
}

interface WorkoutFormProps {
  onSubmit: (config: TrainingBlockConfig) => void;
  token?: Credentials;
}

export function WorkoutForm({ onSubmit, token }: WorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState<'new' | 'extend'>('new');
  const [sourceSpreadsheetId, setSourceSpreadsheetId] = useState<string>('');
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingBlockConfig>>({
    name: 'New Training Block',
    startDate: new Date(),
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
  });

  useEffect(() => {
    const fetchSpreadsheets = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/export?token=${encodeURIComponent(JSON.stringify(token))}`);
        if (!response.ok) {
          throw new Error('Failed to fetch spreadsheets');
        }
        const result = await response.json();
        setSpreadsheets(result.spreadsheets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch spreadsheets');
      } finally {
        setIsLoading(false);
      }
    };

    if (workoutType === 'extend') {
      fetchSpreadsheets();
    }
  }, [token, workoutType]);

  const fetchTrainingMaxes = async (spreadsheetId: string) => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/export?token=${encodeURIComponent(JSON.stringify(token))}&spreadsheetId=${spreadsheetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training maxes');
      }
      const result = await response.json();
      
      if (result.trainingMaxes) {
        setFormData(prev => ({
          ...prev,
          inputType: 'tm',
          exercises: prev.exercises?.map(exercise => ({
            ...exercise,
            inputValue: result.trainingMaxes[exercise.name] || exercise.inputValue,
            trainingMaxPercentage: 1 // Since we're using the actual training max
          }))
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch training maxes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpreadsheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSourceSpreadsheetId(id);
    if (id) {
      fetchTrainingMaxes(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit({
        ...formData as TrainingBlockConfig,
        sourceSpreadsheetId: workoutType === 'extend' ? sourceSpreadsheetId : undefined
      });
    }
  };

  const isFormValid = () => {
    return formData.exercises?.every(exercise => exercise.inputValue > 0) &&
           formData.name?.trim() !== '' &&
           formData.startDate &&
           (workoutType === 'new' || (workoutType === 'extend' && sourceSpreadsheetId));
  };

  const handleExerciseChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises?.map(exercise =>
        exercise.name === name ? { ...exercise, inputValue: value } : exercise
      )
    }));
  };

  const handleTrainingMaxPercentageChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises?.map(exercise =>
        exercise.name === name ? { ...exercise, trainingMaxPercentage: value } : exercise
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Workout Type Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Workout Type</h3>
        <div className="flex gap-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="workout-type-new"
              name="workout-type"
              checked={workoutType === 'new'}
              onChange={() => setWorkoutType('new')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <Label htmlFor="workout-type-new" className="ml-2">New Workout</Label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="workout-type-extend"
              name="workout-type"
              checked={workoutType === 'extend'}
              onChange={() => setWorkoutType('extend')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              disabled={!token}
            />
            <Label htmlFor="workout-type-extend" className="ml-2">Extend Existing Workout</Label>
          </div>
        </div>

        {workoutType === 'extend' && (
          <div className="mt-4">
            <Label htmlFor="sourceSpreadsheet">Source Spreadsheet</Label>
            {isLoading ? (
              <div className="mt-1 text-sm text-gray-500">Loading spreadsheets...</div>
            ) : error ? (
              <div className="mt-1 text-sm text-red-500">{error}</div>
            ) : !token ? (
              <div className="mt-1 text-sm text-gray-500">Please log in with Google to access your spreadsheets</div>
            ) : (
              <select
                id="sourceSpreadsheet"
                value={sourceSpreadsheetId}
                onChange={handleSpreadsheetChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select a spreadsheet</option>
                {spreadsheets.map((spreadsheet) => (
                  <option key={spreadsheet.id} value={spreadsheet.id}>
                    {spreadsheet.name.replace(` - ${SPREADSHEET_IDENTIFIER}`, '')}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Select the Google Sheet containing your existing workout plan. Training maxes will be automatically populated from the final week.
            </p>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {workoutType === 'new' && (
          <div>
            <Label htmlFor="workoutName">Workout Name</Label>
            <input
              type="text"
              id="workoutName"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        )}
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

      {/* Input Type Selection */}
      <div>
        <Label>Input Type</Label>
        <div className="flex gap-4 mt-1">
          <div className="flex items-center">
            <input
              type="radio"
              id="input-type-1rm"
              name="input-type"
              checked={formData.inputType === '1rm'}
              onChange={() => setFormData(prev => ({ ...prev, inputType: '1rm' }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <Label htmlFor="input-type-1rm" className="ml-2">1 Rep Max</Label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="input-type-tm"
              name="input-type"
              checked={formData.inputType === 'tm'}
              onChange={() => setFormData(prev => ({ ...prev, inputType: 'tm' }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <Label htmlFor="input-type-tm" className="ml-2">Training Max</Label>
          </div>
        </div>
      </div>

      {/* Main Lifts */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Main Lifts ({formData.inputType === '1rm' ? '1 Rep Max' : 'Training Max'})</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {formData.exercises?.map(exercise => (
            <div key={exercise.name} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={exercise.name}>{exercise.name}</Label>
                  <input
                    type="number"
                    id={exercise.name}
                    value={exercise.inputValue || ''}
                    onChange={e => handleExerciseChange(exercise.name, Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    min="0"
                    step="0.25"
                    required
                  />
                </div>
                {formData.inputType === '1rm' && (
                  <div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor={`${exercise.name}-tm-percentage`} className="whitespace-nowrap">Training Max %</Label>
                      <input
                        type="number"
                        id={`${exercise.name}-tm-percentage`}
                        value={exercise.trainingMaxPercentage * 100 || ''}
                        onChange={e => handleTrainingMaxPercentageChange(exercise.name, Number(e.target.value) / 100)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        min="1"
                        max="100"
                        step="1"
                        required
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>
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