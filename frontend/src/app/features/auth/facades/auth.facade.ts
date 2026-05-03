import { inject, Injectable } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { computed } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthFacade {
    private store = inject(AuthStore);

    vm = {
        user: this.store.user,
        status: this.store.status,
        error: this.store.error,
        isLoggedIn: computed(() => !!this.store.token()),
        isLoading: computed(() => this.store.status() === 'loading'),
    };

    login(credentials: any) {
        this.store.login(credentials);
    }

    register(dto: any) {
        this.store.register(dto);
    }

    forgotPassword(email: string) {
        this.store.forgotPassword(email);
    }

    logout() {
        this.store.logout();
    }
}
