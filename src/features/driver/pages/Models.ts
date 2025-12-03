// Models.ts
export interface RideRequest {
  id: string;
  pickup: string;
  drop: string;
  price: number;
  passenger: Passenger;
  // Optional driver info injected by backend for frontend convenience
  driver_info?: {
    user?: { id?: string; name?: string; last_name?: string; phone?: string; email?: string };
    driver?: { id?: string; driver_license?: string; rating?: number | string };
    motorcycle?: { id?: string; plate?: string; color?: string; soat?: string; technical_review_date?: string };
  };
}

export interface Passenger {
  id: string;
  name: string;
  rating: number;
}
