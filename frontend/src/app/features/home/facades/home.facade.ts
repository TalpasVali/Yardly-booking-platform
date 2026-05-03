import { Injectable, inject } from '@angular/core';
import { HomeStore } from '../store/home.store';

@Injectable({
    providedIn: 'root',
})
export class HomeFacade {
    private readonly store = inject(HomeStore);

    // View Model for the Component
    readonly vm = {
        featuredFields: this.store.featuredFields,
        popularSports: this.store.popularSports,
        loading: this.store.loading,
        error: this.store.error,
    };

    init() {
        this.store.loadHomeData();
    }
}
