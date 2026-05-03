import { inject } from '@angular/core';
import { patchState, signalStore, type, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import {
  addEntity,
  entityConfig,
  removeEntity,
  setAllEntities,
  upsertEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { CityService } from '../core/services/city.service';
import { City } from './city/city.state';

const cityConfig = entityConfig({
  entity: type<City>(),
  selectId: (city: City) => city._id,
});

export const CitiesStore = signalStore(
  { providedIn: 'root' },
  withEntities(cityConfig),
  withState({
    loading: false,
    error: null as string | null,
  }),
  withMethods((store, cityService = inject(CityService)) => ({
    loadCities: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          cityService.getAllCities().pipe(
            tap((cities) =>
              patchState(store, setAllEntities(cities, cityConfig), { loading: false })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    createCity: rxMethod<Partial<City>>(
      pipe(
        switchMap((dto) =>
          cityService.createCity(dto).pipe(
            tap((city) => patchState(store, addEntity(city, cityConfig))),
            catchError((err) => {
              patchState(store, { error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    updateCity: rxMethod<{ id: string; dto: Partial<City> }>(
      pipe(
        switchMap(({ id, dto }) =>
          cityService.updateCity(id, dto).pipe(
            tap((city) => patchState(store, upsertEntity(city, cityConfig))),
            catchError((err) => {
              patchState(store, { error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    deleteCity: rxMethod<string>(
      pipe(
        switchMap((id) =>
          cityService.deleteCity(id).pipe(
            tap(() => patchState(store, removeEntity(id))),
            catchError((err) => {
              patchState(store, { error: err.message });
              return of(null);
            })
          )
        )
      )
    ),
  })),
  withDevtools('cities'),
);
