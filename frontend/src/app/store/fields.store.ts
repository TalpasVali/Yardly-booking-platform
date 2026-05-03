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
import { FieldsService } from '../core/services/fields.service';
import { Field } from './fields/fields.state';

const fieldConfig = entityConfig({
  entity: type<Field>(),
  selectId: (field: Field) => field._id,
});

export const FieldsStore = signalStore(
  { providedIn: 'root' },
  withEntities(fieldConfig),
  withState({
    loading: false,
    initialized: false,
    error: null as string | null,
    selectedField: null as Field | null,
  }),
  withMethods((store, fieldsService = inject(FieldsService)) => ({
    loadFields: rxMethod<void>(
      pipe(
        tap(() => {
          if (!store.initialized()) {
            patchState(store, { loading: true, error: null });
          }
        }),
        switchMap(() => {
          if (store.initialized()) return of(null);
          return fieldsService.getAllFields().pipe(
            tap((fields) =>
              patchState(store, setAllEntities(fields, fieldConfig), { loading: false, initialized: true })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          );
        })
      )
    ),

    loadField: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          fieldsService.getFieldById(id).pipe(
            tap((field) =>
              patchState(store, upsertEntity(field, fieldConfig), {
                loading: false,
                selectedField: field,
              })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    createField: rxMethod<FormData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((fieldData) =>
          fieldsService.createField(fieldData).pipe(
            tap((field) =>
              patchState(store, addEntity(field, fieldConfig), { loading: false })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    updateField: rxMethod<{ id: string; fieldData: FormData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ id, fieldData }) =>
          fieldsService.updateField(id, fieldData).pipe(
            tap((field) =>
              patchState(store, upsertEntity(field, fieldConfig), { loading: false })
            ),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          )
        )
      )
    ),

    deleteField: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          fieldsService.deleteField(id).pipe(
            tap(() => patchState(store, removeEntity(id), { loading: false })),
            catchError((err) => {
              patchState(store, { loading: false, error: err.message });
              return of(null);
            })
          )
        )
      )
    ),
  })),
  withDevtools('fields'),
);
