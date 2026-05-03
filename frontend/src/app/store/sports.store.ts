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
import { SportsService } from '../core/services/sports.service';
import { Sport } from './sports/sports.model';

const sportConfig = entityConfig({
  entity: type<Sport>(),
  selectId: (sport: Sport) => sport._id,
});

export const SportsStore = signalStore(
  { providedIn: 'root' },
  withEntities(sportConfig),
  withState({
    loading: false,
    error: null as any,
  }),
  withMethods((store, sportsService = inject(SportsService)) => ({
    loadSports: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          sportsService.getAll().pipe(
            tap((sports) =>
              patchState(store, setAllEntities(sports, sportConfig), { loading: false })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err });
              return of(null);
            })
          )
        )
      )
    ),

    createSport: rxMethod<FormData>(
      pipe(
        switchMap((sport) =>
          sportsService.create(sport).pipe(
            tap((created) => patchState(store, addEntity(created, sportConfig))),
            catchError((err) => {
              patchState(store, { error: err });
              return of(null);
            })
          )
        )
      )
    ),

    updateSport: rxMethod<{ id: string; sport: FormData }>(
      pipe(
        switchMap(({ id, sport }) =>
          sportsService.update(id, sport).pipe(
            tap((updated) => patchState(store, upsertEntity(updated, sportConfig))),
            catchError((err) => {
              patchState(store, { error: err });
              return of(null);
            })
          )
        )
      )
    ),

    deleteSport: rxMethod<string>(
      pipe(
        switchMap((id) =>
          sportsService.delete(id).pipe(
            tap(() => patchState(store, removeEntity(id))),
            catchError((err) => {
              patchState(store, { error: err });
              return of(null);
            })
          )
        )
      )
    ),
  })),
  withDevtools('sports'),
);
