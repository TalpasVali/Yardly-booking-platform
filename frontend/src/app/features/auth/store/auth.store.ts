import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { AuthService } from '../../../core/services/auth.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, pipe, switchMap, tap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthState {
    user: any | null;
    token: string | null;
    status: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
    status: 'idle',
    error: null,
};

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({

        // ─── Restore session after page refresh ──────────────────────────────
        loadMe: rxMethod<void>(
            pipe(
                switchMap(() =>
                    authService.getMe().pipe(
                        tap((user) => patchState(store, { user, status: 'idle' })),
                        catchError(() => {
                            // Token is invalid/expired — clear it
                            if (typeof window !== 'undefined') {
                                localStorage.removeItem('access_token');
                            }
                            patchState(store, { user: null, token: null, status: 'idle' });
                            return of(null);
                        })
                    )
                )
            )
        ),

        login: rxMethod<any>(
            pipe(
                tap(() => patchState(store, { status: 'loading', error: null })),
                switchMap((credentials) =>
                    authService.login(credentials).pipe(
                        tap((response) => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('access_token', response.access_token);
                            }
                            patchState(store, {
                                user: response.user,
                                token: response.access_token,
                                status: 'success',
                            });
                            const role = response.user?.role;
                            if (role === 'admin') {
                                router.navigate(['/admin/dashboard']);
                            } else if (role === 'manager') {
                                router.navigate(['/manager/dashboard']);
                            } else {
                                router.navigate(['/']);
                            }
                        }),
                        catchError((err) => {
                            patchState(store, {
                                status: 'error',
                                error: err.error?.message || 'Login failed',
                            });
                            return of(null);
                        })
                    )
                )
            )
        ),

        register: rxMethod<any>(
            pipe(
                tap(() => patchState(store, { status: 'loading', error: null })),
                switchMap((dto) =>
                    authService.register(dto).pipe(
                        tap((response) => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('access_token', response.access_token);
                            }
                            patchState(store, {
                                user: response.user,
                                token: response.access_token,
                                status: 'success',
                            });
                            router.navigate(['/']);
                        }),
                        catchError((err) => {
                            patchState(store, {
                                status: 'error',
                                error: err.error?.message || 'Registration failed',
                            });
                            return of(null);
                        })
                    )
                )
            )
        ),

        forgotPassword: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { status: 'loading', error: null })),
                switchMap((email) =>
                    authService.forgotPassword(email).pipe(
                        tap(() => {
                            patchState(store, { status: 'success' });
                        }),
                        catchError((err) => {
                            patchState(store, {
                                status: 'error',
                                error: err.error?.message || 'Failed to send reset link',
                            });
                            return of(null);
                        })
                    )
                )
            )
        ),

        logout() {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('access_token');
            }
            patchState(store, { user: null, token: null, status: 'idle' });
            router.navigate(['/auth/login']);
        },
    }))
);
