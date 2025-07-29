"use client";

import { useState, useEffect } from "react";

interface MuscleGroup {
  key: string;
  label: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const muscleGroups: MuscleGroup[] = [
  { key: "back_biceps_shoulders", label: "Back, Biceps & Shoulders" },
  { key: "chest_triceps", label: "Chest & Triceps" },
  { key: "legs", label: "Legs" },
];

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// Simplified storage functions
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
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [showDataMenu, setShowDataMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const existingLog = loadLog();
    setLog(existingLog);
    setIsLoading(false);
    
    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (typeof window !== "undefined") {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOnline(navigator.onLine);
      
      // PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowInstallPrompt(true);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // Hide install prompt if already installed
      window.addEventListener('appinstalled', () => {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      });
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      setSelected(log[date] || "");
    }
  }, [date, log, isMounted]);

  function handleSelect(groupKey: string): void {
    setSelected(groupKey);
  }

  function handleSave(): void {
    if (!selected) return;
    const newLog = { ...log, [date]: selected };
    setLog(newLog);
    saveLog(newLog);
    setSelected("");
    
    // Simple haptic feedback on mobile
    if (typeof window !== "undefined" && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setDate(e.target.value);
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        version: 1,
        exportDate: new Date().toISOString(),
        workouts: log,
        totalWorkouts: Object.keys(log).length
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gym-log-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowDataMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.workouts && typeof importData.workouts === 'object') {
        setLog(importData.workouts);
        saveLog(importData.workouts);
        setSelected(importData.workouts[date] || "");
        alert('Data imported successfully!');
      } else {
        alert('Invalid backup file format.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
    setShowDataMenu(false);
  };

  if (isLoading || !isMounted) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg min-h-screen md:min-h-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg min-h-screen md:min-h-0">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
          📱 You&apos;re offline, but the app still works! Data will sync when you&apos;re back online.
        </div>
      )}
      
      {/* Install prompt */}
      {showInstallPrompt && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">📱 Install this app for quick access!</span>
            <div className="space-x-2">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with data menu */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gym Training Log</h2>
        <div className="relative">
          <button
            onClick={() => setShowDataMenu(!showDataMenu)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Data options"
          >
            ⚙️
          </button>
          
          {showDataMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <button
                onClick={handleExportData}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📤 Export Data
              </button>
              <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                📥 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowDataMenu(false)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-100"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      
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
              className={`w-full px-4 py-3 text-left rounded-md border transition-all duration-200 ${
                selected === group.key
                  ? "bg-blue-500 text-white border-blue-500 shadow-md transform scale-[1.02]"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
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
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-all duration-200 transform disabled:transform-none hover:scale-[1.02]"
      >
        {selected ? '💾 Save Workout' : 'Select muscle group to save'}
      </button>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout History</h3>
        {Object.keys(log).length === 0 ? (
          <p className="text-gray-500 text-sm">No workouts logged yet. Start by selecting a muscle group!</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(log)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, groupKey]) => (
                <li key={date} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">{date}</span>
                  <span className="text-sm text-gray-600">
                    {muscleGroups.find((g) => g.key === groupKey)?.label || groupKey}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💾 Data stored securely in your browser
          {!isOnline && " • Working offline"}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          {Object.keys(log).length} workouts logged • Use ⚙️ to backup data
        </p>
        {showInstallPrompt && (
          <p className="text-xs text-blue-600 text-center mt-1">
            📱 Install as app for the best experience
          </p>
        )}
      </div>
    </div>
  );
} 