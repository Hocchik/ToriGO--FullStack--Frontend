import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: DriverState = {
  trips: [],
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
});

export const { addTrip, clearTrips } = driverSlice.actions;
export default driverSlice.reducer;
