import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAvailableTrips } from '../driverSlice';
import type { RootState } from '../../../store';

const POLL_INTERVAL_MS = 15000; // 15 seconds

export const usePolling = (enabled: boolean = true) => {
  const dispatch = useDispatch();
  const pollIdRef = useRef<number | null>(null);
  const availability = useSelector((s: RootState) => s.driver?.availability);
  const pendingRequests = useSelector((s: RootState) => s.driver?.availableTrips || []);
  const loadingTrips = useSelector((s: RootState) => s.driver?.loadingAvailableTrips || false);

    console.log('[DEBUG] 🧲 usePolling hook initialized with:', {
      enabled,
      availability,
      pendingRequests,
      loadingTrips,
    });

  const startPolling = () => {
    console.error('[DEBUG] 🚀 STARTING POLL - Driver availability:', availability);

    // immediate fetch
    try {
      console.error('[DEBUG] 📡 About to dispatch getAvailableTrips (immediate)...');
      dispatch(getAvailableTrips() as any);
      console.error('[DEBUG] ✅ Initial poll dispatched');
    } catch (e) {
      console.error('[DEBUG] ❌ Error in initial poll:', e);
    }

    // set interval for periodic polling
    if (pollIdRef.current === null) {
      pollIdRef.current = window.setInterval(() => {
        console.error('[DEBUG] 📡 Polling available trips (interval)...');
        try {
          dispatch(getAvailableTrips() as any);
        } catch (e) {
          console.error('[DEBUG] ❌ Error in polling interval:', e);
        }
      }, POLL_INTERVAL_MS) as unknown as number;

      console.error(`[DEBUG] ⏱️  Polling interval set to ${POLL_INTERVAL_MS}ms`);
    }
  };

  const stopPolling = () => {
    if (pollIdRef.current !== null) {
      console.error('[DEBUG] 🛑 STOPPING POLL');
      window.clearInterval(pollIdRef.current);
      pollIdRef.current = null;
    }
  };

  // Start/stop polling based on availability and enabled flag
  useEffect(() => {
    console.error('[DEBUG] 🔍 Availability/enabled changed:', { availability, enabled });

    if (enabled && availability === 'available') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [availability, enabled, dispatch]);

  return {
    pendingRequests,
    loadingTrips,
    startPolling,
    stopPolling,
  };
};
