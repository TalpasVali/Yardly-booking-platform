import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { ReservationsService } from '../core/services/reservation.service';
import { Reservation } from './reservation/reservation.state';

interface ReservationsState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  availableSlots: { from: string; to: string }[];
  loading: boolean;
  error: string | null;
}

const initialState: ReservationsState = {
  reservations: [],
  selectedReservation: null,
  availableSlots: [],
  loading: false,
  error: null,
};

export const ReservationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      reservationsService = inject(ReservationsService),
      router = inject(Router)
    ) => ({
      loadAvailableSlots: rxMethod<{ field: string; date: string; duration: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ field, date, duration }) =>
            reservationsService.getAvailableSlots(field, date, duration).pipe(
              tap((slots) =>
                patchState(store, { availableSlots: slots, loading: false })
              ),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      clearAvailableSlots() {
        patchState(store, { availableSlots: [] });
      },

      loadReservations: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            reservationsService.getAll().pipe(
              tap((reservations) =>
                patchState(store, { reservations, loading: false })
              ),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      loadMyReservations: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            reservationsService.getMyReservations().pipe(
              tap((reservations) =>
                patchState(store, { reservations, loading: false })
              ),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      loadReservation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            reservationsService.getById(id).pipe(
              tap((reservation) => {
                const reservations = store.reservations();
                const exists = reservations.some((r) => r._id === id);
                patchState(store, {
                  reservations: exists
                    ? reservations.map((r) => (r._id === id ? reservation : r))
                    : [...reservations, reservation],
                  loading: false,
                });
              }),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      createReservation: rxMethod<Omit<Reservation, '_id' | 'slots'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((reservation) =>
            reservationsService.createReservation(reservation).pipe(
              tap((created) => {
                patchState(store, {
                  reservations: [...store.reservations(), created],
                  selectedReservation: created,
                  loading: false,
                });
                router.navigate(['/booking-confirmation']);
              }),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      updateReservation: rxMethod<{ id: string; dto: Partial<Reservation> }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, dto }) =>
            reservationsService.updateReservation(id, dto).pipe(
              tap((updated) => {
                patchState(store, {
                  reservations: store
                    .reservations()
                    .map((r) => (r._id === id ? updated : r)),
                  loading: false,
                });
              }),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),

      deleteReservation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            reservationsService.deleteReservation(id).pipe(
              tap(() => {
                patchState(store, {
                  reservations: store.reservations().filter((r) => r._id !== id),
                  loading: false,
                });
              }),
              catchError((err) => {
                patchState(store, { loading: false, error: err.message });
                return of(null);
              })
            )
          )
        )
      ),
    })
  ),
  withDevtools('reservations'),
);
