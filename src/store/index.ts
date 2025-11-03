import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import passengerReducer from '../features/passenger/passengerSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    passenger: passengerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;