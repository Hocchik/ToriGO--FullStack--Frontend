// features/passenger/store/passengerSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RideRequest } from "../../types/trip";

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
});

export const { requestRide, confirmRide, finishLoading, cancelRide } = passengerSlice.actions;
export default passengerSlice.reducer;