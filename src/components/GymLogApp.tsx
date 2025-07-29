"use client";

import { useState, useEffect } from "react";

interface MuscleGroup {
  key: string;
  label: string;
}

const muscleGroups: MuscleGroup[] = [
  { key: "back_biceps_shoulders", label: "Back, Biceps & Shoulders" },
  { key: "chest_triceps", label: "Chest & Triceps" },
  { key: "legs", label: "Legs" },
];

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLog(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("gymLog") || "{}");
  } catch {
    return {};
  }
}

function saveLog(log: Record<string, string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("gymLog", JSON.stringify(log));
}

export default function GymLogApp() {
  const [date, setDate] = useState<string>(getToday());
  const [selected, setSelected] = useState<string>("");
  const [log, setLog] = useState<Record<string, string>>({});

  useEffect(() => {
    setLog(loadLog());
  }, []);

  useEffect(() => {
    setSelected(log[date] || "");
  }, [date, log]);

  function handleSelect(groupKey: string): void {
    setSelected(groupKey);
  }

  function handleSave(): void {
    if (!selected) return;
    const newLog = { ...log, [date]: selected };
    setLog(newLog);
    saveLog(newLog);
    setSelected("");
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDate(e.target.value);
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gym Training Log</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date:
        </label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          max={getToday()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Muscle Group:</h3>
        <div className="space-y-2">
          {muscleGroups.map((group) => (
            <button
              key={group.key}
              onClick={() => handleSelect(group.key)}
              className={`w-full px-4 py-3 text-left rounded-md border transition-colors ${
                selected === group.key
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!selected}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        Save Workout
      </button>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout History</h3>
        {Object.keys(log).length === 0 ? (
          <p className="text-gray-500 text-sm">No workouts logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(log)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, groupKey]) => (
                <li key={date} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-gray-900">{date}</span>
                  <span className="text-sm text-gray-600">
                    {muscleGroups.find((g) => g.key === groupKey)?.label || groupKey}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-6 text-center">
        Data is stored locally in your browser.
      </p>
    </div>
  );
} 