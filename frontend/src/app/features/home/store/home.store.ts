import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { inject } from '@angular/core';
import { FieldsService } from '../../../core/services/fields.service';
import { SportsService } from '../../../core/services/sports.service';
import { Field } from '../../../store/fields/fields.state';
import { Sport } from '../../../store/sports/sports.model';
import { pipe, switchMap, forkJoin, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export interface HomeState {
    featuredFields: Field[];
    popularSports: Sport[];
    loading: boolean;
    error: string | null;
}

const initialState: HomeState = {
    featuredFields: [],
    popularSports: [],
    loading: false,
    error: null,
};

export const HomeStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, fieldsService = inject(FieldsService), sportsService = inject(SportsService)) => ({
        loadHomeData: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    forkJoin({
                        fields: fieldsService.getAllFields(),
                        sports: sportsService.getAll(),
                    }).pipe(
                        tapResponse({
                            next: ({ fields, sports }: { fields: Field[], sports: Sport[] }) =>
                                patchState(store, {
                                    featuredFields: fields.slice(0, 3), // Show first 3 as featured
                                    popularSports: sports,
                                    loading: false,
                                }),
                            error: (error: any) =>
                                patchState(store, {
                                    error: error.message || 'Failed to load homepage data',
                                    loading: false,
                                }),
                        })
                    )
                )
            )
        ),
    }))
);
