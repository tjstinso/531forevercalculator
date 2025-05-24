'use client';

import { WorkoutForm } from '@/components/WorkoutForm';
import { TrainingTable } from '@/components/TrainingTable';
import { GoogleExport } from '@/components/GoogleExport';
import { useEffect, useState } from 'react';
import type { TrainingBlockConfig } from '@/types/workout';
import { createTrainingBlock } from '@/lib/workout';
import { formatSet } from '@/utils/format';
import { CodeResponse, useGoogleLogin } from '@react-oauth/google';
import { Credentials } from '@/types/auth';

export default function Home() {
  const [trainingBlock, setTrainingBlock] = useState<ReturnType<typeof createTrainingBlock> | null>(null);
  const [token, setToken] = useState<Credentials | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [sourceSpreadsheetId, setSourceSpreadsheetId] = useState<string | undefined>(undefined);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const { userId, token } = await response.json();
          setUserId(userId);
          setToken(token);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      setToken(undefined);
      setUserId(undefined);
      setTrainingBlock(null);
      setSourceSpreadsheetId(undefined);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleFormSubmit = (config: TrainingBlockConfig) => {
    const block = createTrainingBlock(config);
    setTrainingBlock(block);
    console.log(block)
    setSourceSpreadsheetId(config.sourceSpreadsheetId);
  };

  const transformTrainingBlockForSheets = () => {
    if (!trainingBlock) return [];

    // Create header row with dynamic set columns
    const maxSets = Math.max(
      ...trainingBlock.leaderCycles.flatMap(cycle => 
        cycle.weeks.flatMap(week => 
          week.exercises.map(exercise => exercise.sets.length)
        )
      ),
      ...trainingBlock.seventhWeek.exercises.map(exercise => exercise.sets.length),
      ...trainingBlock.anchorCycles.flatMap(cycle => 
        cycle.weeks.flatMap(week => 
          week.exercises.map(exercise => exercise.sets.length)
        )
      ),
      ...trainingBlock.finalSeventhWeek.exercises.map(exercise => exercise.sets.length)
    );

    const setHeaders = Array.from({ length: maxSets }, (_, i) => `Set ${i + 1}`);
    const rows = [
      ['Week', 'Type', 'Exercise', 'Training Max', ...setHeaders],
    ];

    // Add leader cycles
    trainingBlock.leaderCycles.forEach((cycle, cycleIndex) => {
      cycle.weeks.forEach((week, weekIndex) => {
        week.exercises.forEach(exercise => {
          const sets = exercise.sets.map(set => formatSet(set, exercise.trainingMax, false));
          rows.push([
            `Week ${cycleIndex * 3 + weekIndex + 1}`,
            `Leader ${cycleIndex + 1} - Week ${weekIndex + 1}`,
            exercise.name,
            `${exercise.trainingMax} lbs`,
            ...sets,
            ...Array(maxSets - sets.length).fill('') // Fill remaining set columns with empty strings
          ]);
        });
      });
    });

    // Add seventh week
    trainingBlock.seventhWeek.exercises.forEach(exercise => {
      const sets = exercise.sets.map(set => formatSet(set, exercise.trainingMax, false));
      rows.push([
        'Deload Week',
        'Deload',
        exercise.name,
        `${exercise.trainingMax} lbs`,
        ...sets,
        ...Array(maxSets - sets.length).fill('')
      ]);
    });

    // Add anchor cycles
    trainingBlock.anchorCycles.forEach((cycle, cycleIndex) => {
      cycle.weeks.forEach((week, weekIndex) => {
        week.exercises.forEach(exercise => {
          const sets = exercise.sets.map(set => formatSet(set, exercise.trainingMax, false));
          rows.push([
            `Week ${(trainingBlock.leaderCycles.length * 3) + 1 + cycleIndex * 3 + weekIndex}`,
            `Anchor ${cycleIndex + 1} - Week ${weekIndex + 1}`,
            exercise.name,
            `${exercise.trainingMax} lbs`,
            ...sets,
            ...Array(maxSets - sets.length).fill('')
          ]);
        });
      });
    });

    // Add final seventh week
    trainingBlock.finalSeventhWeek.exercises.forEach(exercise => {
      const sets = exercise.sets.map(set => formatSet(set, exercise.trainingMax, false));
      rows.push([
        'Final Week',
        trainingBlock.finalSeventhWeek.type === 'tm_test' ? 'TM Test' : 'Deload',
        exercise.name,
        `${exercise.trainingMax} lbs`,
        ...sets,
        ...Array(maxSets - sets.length).fill('')
      ]);
    });

    return rows;
  };

  const handleExportCSV = () => {
    if (!trainingBlock) return;

    // Convert to CSV string
    const csvContent = transformTrainingBlockForSheets().map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `531_Workout_Plan_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const login = useGoogleLogin({
    onSuccess: async (codeResponse: CodeResponse) => {
      try {
        // Exchange the auth code for tokens
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: codeResponse.code }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange auth code');
        }
        const tokenResponse: Credentials = await response.json();
        
        // Save token to database and create session
        await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tokenResponse),
        });

        // Create session
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_token: tokenResponse.id_token }),
        });

        if (verifyResponse.ok) {
          const { userId } = await verifyResponse.json();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });
          setUserId(userId);
          setToken(tokenResponse);
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    },
    onError: () => console.log("houston we have a problem"),
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets"
    ].join(" "),
    flow: "auth-code"
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        {!token ? (
          <button
            onClick={() => login()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login with Google
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        )}
      </div>

      {token ? (
        <>
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Your Training Block</h2>
            <WorkoutForm onSubmit={handleFormSubmit} token={token} />
          </section>

          {trainingBlock && (
            <section className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Training Block Plan</h2>
                <div className="space-x-4">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Export to CSV
                  </button>
                  <GoogleExport
                    data={transformTrainingBlockForSheets()}
                    title={(() => trainingBlock.name)()}
                    sheetName="Training Plan"
                    token={token}
                    sourceSpreadsheetId={sourceSpreadsheetId}
                    setSourceSpreadsheetId={setSourceSpreadsheetId}
                  />
                </div>
              </div>
              <TrainingTable trainingBlock={trainingBlock} />
            </section>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to 531 Training</h2>
          <p className="text-gray-600 mb-8">
            Please log in with your Google account to start creating your training plan.
          </p>
        </div>
      )}
    </div>
  );
}