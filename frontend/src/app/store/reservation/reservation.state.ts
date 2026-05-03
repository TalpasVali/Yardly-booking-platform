export interface Reservation {
  _id?: string;
  field: string;
  user: string;
  date: string;
  time: string;
  duration: string;
  isEvent?: boolean;
  isRecurrent?: boolean;
  slots?: { from: string; to: string }[];
}

export interface ReservationsState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  availableSlots: { from: string; to: string }[];
  loading: boolean;
  error: string | null;
}

export const initialState: ReservationsState = {
  reservations: [],
  selectedReservation: null,
  availableSlots: [],
  loading: false,
  error: null,
};
