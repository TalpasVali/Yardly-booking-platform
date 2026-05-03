export interface Schedule {
  day: string;
  from: string;
  to: string;
}

export interface Field {
  _id: string;
  name: string;
  sport: string;
  address: string;
  locationUrl?: string;
  pricePerHour: number;
  schedule: Schedule[];
  images: string[];
  facilities: string[];
  averageRating: number;
  status: string;
  capacity: number;
  city: string;
  description?: string;
  manager: {
    _id: string;
    username: string;
    email: string;
  };
}

export interface FieldsState {
  fields: Field[];
  loading: boolean;
  error: string | null;
  selectedField: Field | null;
}

export const initialFieldsState: FieldsState = {
  fields: [],
  loading: false,
  error: null,
  selectedField: null,
};
