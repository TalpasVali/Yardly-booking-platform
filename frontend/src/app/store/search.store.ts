import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { SearchbarInterface, SearchState } from './search/search.state';

const initialState: SearchState = {
  searchBarInterface: null,
  loading: false,
};

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, router = inject(Router)) => ({
    search(filters: SearchbarInterface) {
      patchState(store, { searchBarInterface: filters });
      router.navigate(['/fields']);
    },
  })),
  withDevtools('search'),
);
