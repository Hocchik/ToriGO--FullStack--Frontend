import { useDispatch, useSelector } from 'react-redux';
import { setDriverAvailability } from '../driverSlice';
import type { RootState } from '../../../store';

export const useAvailability = () => {
  const dispatch = useDispatch();
  const availability = useSelector((s: RootState) => s.driver?.availability);

  const setAvailability = async (status: 'offline' | 'available' | 'busy') => {
    console.error(`[DEBUG] 🔴 setAvailability called with: ${status}`);
    try {
      const result = await dispatch(setDriverAvailability(status) as any);
      console.error('[DEBUG] 📡 Dispatch result:', result);
      return result;
    } catch (e) {
      console.error('[DEBUG] ❌ Error setting availability:', e);
      throw e;
    }
  };

  return {
    availability,
    setAvailability,
  };
};
