// features/passenger/store/passengerSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RideRequest } from "../../types/trip";
import TripService from '../../services/TripService';

// Async thunk: create/upsert a trip via TripService
export const createTrip = createAsyncThunk(
  'passenger/createTrip',
  async (payload: RideRequest, { rejectWithValue }) => {
    try {
      const body: any = {
        external_id: (payload as any).external_id,
        pickup: payload.pickup,
        destination: payload.destination,
        type: payload.type,
        payment: payload.payment,
        pickup_coords: payload.pickupCoords,
        destination_coords: payload.destinationCoords,
        price: payload.price,
        created_at: new Date().toISOString(),
      };
      // Use the dedicated request endpoint for passenger trip requests
      const res = await TripService.requestTrip(body);
      return { server: res?.data || null, sent: body };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data || err?.message || 'Error creating trip');
    }
  }
);

interface PassengerState {
  loading: boolean;
  ride: RideRequest | null;
  accepted: boolean;
}

const initialState: PassengerState = {
  loading: false,
  ride: null,
  accepted: false,
};

const passengerSlice = createSlice({
  name: "passenger",
  initialState,
  reducers: {
    requestRide(state, action: PayloadAction<RideRequest>) {
      state.loading = true;
      state.ride = action.payload;
      state.accepted = false;
    },
    confirmRide(state) {
      state.loading = false;
      state.accepted = true;
    },
    finishLoading(state) {
      state.loading = false;
    },
    cancelRide(state) {
      state.ride = null;
      state.accepted = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        // keep optimistic ride (already set by requestRide) but attach server info if any
        // action.meta.arg contains the original RideRequest
        state.ride = { ...(action.meta.arg as RideRequest), ...(action.payload?.server || {}) } as any;
      })
      .addCase(createTrip.rejected, (state) => {
        state.loading = false;
        state.ride = null;
      });
  },
});

export const { requestRide, confirmRide, finishLoading, cancelRide } = passengerSlice.actions;
export default passengerSlice.reducer;