import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import TripService from '../../services/TripService';
import * as DriverService from '../../services/DriverService';

interface DriverProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  vehicleInfo?: any;
  licenseNumber?: string;
  soatNumber?: string;
  technicalReview?: any;
  [k: string]: any;
}

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
  profile: DriverProfile | null;
  pendingDocuments: any[];
  loadingProfile: boolean;
  profileError?: string | null;
}

const initialState: DriverState = {
  trips: [],
  availability: 'offline',
  profile: null,
  pendingDocuments: [],
  loadingProfile: false,
  profileError: null,
};

const mapProfileResponse = (data: any): DriverProfile => {
  const user = data?.user ?? data ?? {};
  const driver = data?.driver ?? {};
  const motorcycle = data?.motorcycle ?? data?.motorcycle_info ?? data?.vehicle ?? {};

  return {
    id: (user.id ?? driver.id ?? data.id) as string || undefined,
    firstName: (user.firstName ?? user.first_name ?? user.name ?? user.full_name) ?? undefined,
    lastName: (user.lastName ?? user.last_name ?? user.surname) ?? undefined,
    email: (user.email ?? user.email_address ?? user.contact_email) ?? undefined,
    phone: (user.phone ?? user.phone_number ?? user.mobile) ?? undefined,
    profileImage: (user.profileImage ?? user.avatar ?? user.profile_image) ?? undefined,
    licenseNumber: (driver.licenseNumber ?? driver.license_number ?? driver.driver_license) as string,
    soatNumber: (motorcycle.soat ?? motorcycle.soatNumber ?? motorcycle.soat_number) as string,
    technicalReview: data.technical_review ?? { reviewDate: motorcycle.technical_review_date },
    vehicleInfo: {
      plate: motorcycle.plate ?? motorcycle.vehicle_plate ?? motorcycle.plate_number,
      color: motorcycle.color ?? motorcycle.colour ?? motorcycle.vehicle_color,
    },
    // include raw for any additional use
    raw: data,
  };
};

export const getDriverProfile = createAsyncThunk('driver/getProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await DriverService.getMyProfile();
    const data = res.data ?? {};
    return mapProfileResponse(data);
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || err?.message || 'Failed to fetch profile');
  }
});

export const updateDriverProfile = createAsyncThunk('driver/updateProfile', async (body: any, { rejectWithValue }) => {
  try {
    const res = await DriverService.updateMyProfile(body);
    const data = res.data ?? {};
    // return both the mapped profile and the raw response so callers can inspect actions/pendingDocuments
    return { profile: mapProfileResponse(data), raw: data };
  } catch (err: any) {
    return rejectWithValue(err?.response?.data || err?.message || 'Failed to update profile');
  }
});

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
      // availability handlers (from TripService)
      .addCase(setDriverAvailability.pending, (_state) => {
        // while pending, keep previous availability
      })
      .addCase(setDriverAvailability.fulfilled, (state, action) => {
        if (action.payload && (action.payload.availability || action.payload.status)) {
          state.availability = (action.payload.availability || action.payload.status) as any;
        }
      })
      .addCase(setDriverAvailability.rejected, (state) => {
        state.availability = 'offline';
      })

      // profile handlers
      .addCase(getDriverProfile.pending, (state) => {
        state.loadingProfile = true;
        state.profileError = null;
      })
      .addCase(getDriverProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loadingProfile = false;
        state.profile = action.payload;
      })
      .addCase(getDriverProfile.rejected, (state, action: any) => {
        state.loadingProfile = false;
        state.profileError = action.payload ?? action.error?.message;
      })

      .addCase(updateDriverProfile.pending, (state) => {
        state.loadingProfile = true;
      })
      .addCase(updateDriverProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loadingProfile = false;
        // thunk may return { profile, raw } or a raw profile object
        state.profile = (action.payload && action.payload.profile) ? action.payload.profile : action.payload;
      })
      .addCase(updateDriverProfile.rejected, (state, action: any) => {
        state.loadingProfile = false;
        state.profileError = action.payload ?? action.error?.message;
      });
  },
});

// (profile thunks wired in createSlice.extraReducers above)

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

// no-op: extraReducers are already attached via createSlice above

export const { addTrip, clearTrips } = driverSlice.actions;
export default driverSlice.reducer;
