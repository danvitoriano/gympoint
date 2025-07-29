import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';
import type { WorkoutLog } from './storage';

// Cloud storage service using Supabase
export class CloudStorage {
  private supabase;
  private userId: string | null = null;

  constructor() {
    // Initialize with your Supabase credentials
    // Replace with your actual Supabase URL and anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Simple anonymous user creation for this demo
  async getOrCreateUserId(): Promise<string> {
    if (this.userId) return this.userId;

    // Try to get stored user ID
    const storedUserId = localStorage.getItem('gym_user_id');
    if (storedUserId) {
      this.userId = storedUserId;
      return storedUserId;
    }

    // Create new anonymous user ID
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gym_user_id', newUserId);
    this.userId = newUserId;
    return newUserId;
  }

  // Sync local data to cloud
  async syncToCloud(): Promise<boolean> {
    try {
      const userId = await this.getOrCreateUserId();
      const localData = await storage.loadLog();
      
      const { error } = await this.supabase
        .from('workout_logs')
        .upsert({
          user_id: userId,
          data: localData,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Cloud sync failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Cloud sync error:', error);
      return false;
    }
  }

  // Load data from cloud
  async syncFromCloud(): Promise<WorkoutLog | null> {
    try {
      const userId = await this.getOrCreateUserId();
      
      const { data, error } = await this.supabase
        .from('workout_logs')
        .select('data, last_updated')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Cloud load failed:', error);
        return null;
      }

      return data?.data || null;
    } catch (error) {
      console.error('Cloud load error:', error);
      return null;
    }
  }

  // Check if cloud has newer data than local
  async shouldSyncFromCloud(): Promise<boolean> {
    try {
      const userId = await this.getOrCreateUserId();
      
      const { data, error } = await this.supabase
        .from('workout_logs')
        .select('last_updated')
        .eq('user_id', userId)
        .single();

      if (error || !data) return false;

      const cloudTimestamp = new Date(data.last_updated).getTime();
      const localTimestamp = parseInt(localStorage.getItem('gymLog_lastUpdated') || '0');

      return cloudTimestamp > localTimestamp;
    } catch (error) {
      console.error('Sync check error:', error);
      return false;
    }
  }

  // Get sync status info
  async getSyncStatus(): Promise<{
    hasCloudData: boolean;
    lastCloudSync: string | null;
    conflictDetected: boolean;
  }> {
    try {
      const userId = await this.getOrCreateUserId();
      
      const { data, error } = await this.supabase
        .from('workout_logs')
        .select('last_updated')
        .eq('user_id', userId)
        .single();

      const hasCloudData = !error && !!data;
      const lastCloudSync = data?.last_updated || null;
      const shouldSync = await this.shouldSyncFromCloud();

      return {
        hasCloudData,
        lastCloudSync,
        conflictDetected: shouldSync
      };
    } catch (error) {
      return {
        hasCloudData: false,
        lastCloudSync: null,
        conflictDetected: false
      };
    }
  }
}

export const cloudStorage = new CloudStorage();

// Supabase Database Schema (SQL)
export const SUPABASE_SCHEMA = `
-- Create workout_logs table
CREATE TABLE workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);

-- Enable Row Level Security
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their own data
CREATE POLICY "Users can access their own workout logs" ON workout_logs
  FOR ALL USING (true);  -- For demo purposes, allowing all access
`;

// Environment variables needed (.env.local):
export const ENV_TEMPLATE = `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
`; 