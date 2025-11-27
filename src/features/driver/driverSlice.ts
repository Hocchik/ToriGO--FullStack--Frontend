import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import TripService from '../../services/TripService';

export interface TripRecord {
  id: string;
  driverId: string;
  passengerId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: 'FINISHED' | 'CANCELED';
  price?: number;
  startedAt?: string | null;
  pickupAt?: string | null;
  finishedAt?: string | null;
  canceledAt?: string | null;
  cancelReason?: string | null;
  raw?: any; // optional full payload
  // optional recorded GPS trace during the trip
  driverTrace?: Array<{ lat: number; lng: number; ts: string }>;
}

interface DriverState {
  trips: TripRecord[];
  availability: 'offline' | 'available' | 'busy';
}

const initialState: DriverState = {
  trips: [],
  availability: 'offline',
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    addTrip(state, action: PayloadAction<TripRecord>) {
      state.trips.push(action.payload);
    },
    clearTrips(state) {
      state.trips = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setDriverAvailability.pending, (state) => {
        // while pending, keep previous availability
      })
      .addCase(setDriverAvailability.fulfilled, (state, action) => {
        // server may return { availability: 'available' }
        if (action.payload && (action.payload.availability || action.payload.status)) {
          state.availability = (action.payload.availability || action.payload.status) as any;
        }
      })
      .addCase(setDriverAvailability.rejected, (state) => {
        // on failure keep offline as fallback
        state.availability = 'offline';
      });
  },
});

// Thunk to set driver availability via backend
export const setDriverAvailability = createAsyncThunk(
  'driver/setAvailability',
  async (availability: 'offline' | 'available' | 'busy', { rejectWithValue }) => {
    try {
      const res = await TripService.setAvailability({ availability });
      return res?.data || { availability };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message || 'Failed to set availability');
    }
  }
);

// Thunk to accept a trip (driver accepts a pending trip)
export const acceptTrip = createAsyncThunk(
  'driver/acceptTrip',
  async (body: { tripId: string } | { id: string }, { rejectWithValue }) => {
    try {
      const payload = (body as any).tripId ? body : { tripId: (body as any).id };
      const res = await TripService.acceptTrip(payload);
      return res?.data || payload;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message || 'Failed to accept trip');
    }
  }
);

// update availability in reducers when thunk resolves
driverSlice.reducer && (function attachExtra() {
  const _orig = driverSlice.reducer;
  // we won't replace the reducer here; the extra reducers will be consumed by the store via slice.extraReducers if used.
})();

export const { addTrip, clearTrips } = driverSlice.actions;
export default driverSlice.reducer;
