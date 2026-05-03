import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../../features/auth/facades/auth.facade';
import { map } from 'rxjs';

export const authGuard = () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    if (!authFacade.vm.isLoggedIn()) {
        router.navigate(['/auth/login']);
        return false;
    }
    return true;
};

export const guestGuard = () => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    if (authFacade.vm.isLoggedIn()) {
        router.navigate(['/']);
        return false;
    }
    return true;
};
