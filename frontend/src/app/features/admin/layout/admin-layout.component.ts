import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../auth/facades/auth.facade';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  protected authFacade = inject(AuthFacade);

  get userInitials(): string {
    const name = this.authFacade.vm.user()?.fullName || this.authFacade.vm.user()?.email || 'A';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  get displayName(): string {
    return this.authFacade.vm.user()?.fullName || 'Admin';
  }

  logout() {
    this.authFacade.logout();
  }

  navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users',     label: 'Users',     icon: 'group' },
    { path: '/admin/managers',  label: 'Managers',  icon: 'badge' },
    { path: '/admin/fields',    label: 'Fields',    icon: 'stadium' },
    { path: '/admin/disputes',  label: 'Disputes',  icon: 'gavel' },
    { path: '/admin/bookings',  label: 'Bookings',  icon: 'calendar_today' },
    { path: '/admin/finances',  label: 'Finances',  icon: 'payments' },
  ];
}
