// src/hooks/useDates.ts
import { useState, useEffect, useCallback } from 'react';
import { dateService } from '@/services/dateService';
import type { DateEntry } from '@/types/date';

export function useDates() {
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [upcoming, setUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dateService.getDates();
      setDates(data.dates);
      setUpcoming(data.upcoming);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDates();
    });
  }, [fetchDates]);

  return { dates, upcoming, loading, error, fetchDates };
}
