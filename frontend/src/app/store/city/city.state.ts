import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface City {
  _id: string;
  name: string;
  country?: string;
}

export interface CityState extends EntityState<City> {
  loading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<City> = createEntityAdapter<City>({
  selectId: (city) => city._id,
});

export const initialState: CityState = adapter.getInitialState({
  loading: false,
  error: null,
});
