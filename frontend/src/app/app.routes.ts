import { Routes } from '@angular/router';

export const routes: Routes = [
  // ─── Public / User ────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'fields',
    loadComponent: () => import('./features/fields-list/fields-list.component').then(m => m.FieldsListComponent),
  },
  {
    path: 'field-details/:id',
    loadComponent: () => import('./features/field-details/field-details.component').then(m => m.FieldDetailsComponent),
  },
  {
    path: 'reservations',
    loadComponent: () => import('./features/reservations/reservations.component').then(m => m.ReservationsComponent),
  },
  {
    path: 'booking-confirmation',
    loadComponent: () => import('./features/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
  },
  {
    path: 'booking-details/:id',
    loadComponent: () => import('./features/booking-details/booking-details.component').then(m => m.BookingDetailsComponent),
  },
  {
    path: 'join/:code',
    loadComponent: () => import('./features/join-game/join-game.component').then(m => m.JoinGameComponent),
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent),
  },

  // ─── Manager Portal ───────────────────────────────────────────────────────
  {
    path: 'manager',
    loadComponent: () => import('./features/manager/layout/manager-layout.component').then(m => m.ManagerLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
      },
      {
        path: 'fields',
        loadComponent: () => import('./features/manager/fields/manager-fields.component').then(m => m.ManagerFieldsComponent),
      },
      {
        path: 'field-editor',
        loadComponent: () => import('./features/manager/field-editor/field-editor.component').then(m => m.FieldEditorComponent),
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/manager/reservations/manager-reservations.component').then(m => m.ManagerReservationsComponent),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/manager/analytics/manager-analytics.component').then(m => m.ManagerAnalyticsComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/manager/settings/manager-settings.component').then(m => m.ManagerSettingsComponent),
      },
    ],
  },

  // ─── Admin Portal ─────────────────────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'managers',
        loadComponent: () => import('./features/admin/managers/admin-managers.component').then(m => m.AdminManagersComponent),
      },
      {
        path: 'fields',
        loadComponent: () => import('./features/admin/fields/admin-fields.component').then(m => m.AdminFieldsComponent),
      },
      {
        path: 'disputes',
        loadComponent: () => import('./features/admin/disputes/admin-disputes.component').then(m => m.AdminDisputesComponent),
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/admin/bookings/admin-bookings.component').then(m => m.AdminBookingsComponent),
      },
      {
        path: 'finances',
        loadComponent: () => import('./features/admin/finances/admin-finances.component').then(m => m.AdminFinancesComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent),
      },
      {
        path: 'cities',
        loadComponent: () => import('./features/admin/cities/admin-cities.component').then(m => m.AdminCitiesComponent),
      },
    ],
  },

  // ─── 404 ──────────────────────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
