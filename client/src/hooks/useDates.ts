// src/hooks/useDates.ts
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { dateService } from '@/services/dateService';
import type { DateEntry } from '@/types/date';

export function useDates() {
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [upcoming, setUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dateService.getDates();
      setDates(data.dates);
      setUpcoming(data.upcoming);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load dates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDates();
    });
  }, [fetchDates]);

  return { dates, upcoming, loading, fetchDates };
}
