import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { User, UsersService, UpdateUserDto } from '../services/users.service';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, usersService = inject(UsersService)) => ({

    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          usersService.getAll().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, loading: false }),
              error: (err: any) =>
                patchState(store, { error: err.message ?? 'Eroare la încărcarea utilizatorilor', loading: false }),
            })
          )
        )
      )
    ),

    loadUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          usersService.getById(id).pipe(
            tapResponse({
              next: (user) => patchState(store, { selectedUser: user, loading: false }),
              error: (err: any) =>
                patchState(store, { error: err.message ?? 'Utilizatorul nu a fost găsit', loading: false }),
            })
          )
        )
      )
    ),

    updateUser: rxMethod<{ id: string; dto: UpdateUserDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, dto }) =>
          usersService.update(id, dto).pipe(
            tapResponse({
              next: (updated) =>
                patchState(store, {
                  users: store.users().map((u) => (u._id === updated._id ? updated : u)),
                  selectedUser: updated,
                  loading: false,
                }),
              error: (err: any) =>
                patchState(store, { error: err.message ?? 'Eroare la actualizare', loading: false }),
            })
          )
        )
      )
    ),

    deleteUser: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          usersService.delete(id).pipe(
            tapResponse({
              next: () =>
                patchState(store, {
                  users: store.users().filter((u) => u._id !== id),
                  loading: false,
                }),
              error: (err: any) =>
                patchState(store, { error: err.message ?? 'Eroare la ștergere', loading: false }),
            })
          )
        )
      )
    ),

    clearSelectedUser() {
      patchState(store, { selectedUser: null });
    },
  }))
);
