import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import passengerReducer from '../features/passenger/passengerSlice';
import driverReducer from '../features/driver/driverSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    passenger: passengerReducer,
    driver: driverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;