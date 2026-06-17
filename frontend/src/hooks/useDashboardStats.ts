// src/hooks/useDashboardStats.ts
// ============================================================
// Custom hook for dashboard stats data.
//
// Demonstrates the recommended data-fetching pattern:
//   - Loading and error states
//   - Automatic refetch interval
//   - Manual refetch trigger
//
// In a real project you'd replace this with React Query
// (useQuery), but this vanilla version is great for interviews
// because it shows you understand the underlying mechanics.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { logsApi } from '../api/services';
import type { DashboardStats } from '../types';

interface UseDashboardStatsOptions {
  aquariumId?: string;
  refetchIntervalMs?: number; // Auto-refresh, e.g. 60_000 for 1 min
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardStats({
  aquariumId,
  refetchIntervalMs,
}: UseDashboardStatsOptions = {}): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const data = await logsApi.getStats(aquariumId);
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') return;
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [aquariumId]);

  // Initial fetch + when aquariumId changes
  useEffect(() => {
    fetchStats();
    return () => abortRef.current?.abort();
  }, [fetchStats]);

  // Optional polling
  useEffect(() => {
    if (!refetchIntervalMs) return;
    const interval = setInterval(fetchStats, refetchIntervalMs);
    return () => clearInterval(interval);
  }, [fetchStats, refetchIntervalMs]);

  return { stats, isLoading, error, refetch: fetchStats };
}
