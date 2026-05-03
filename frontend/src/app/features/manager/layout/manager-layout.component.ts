import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../auth/facades/auth.facade';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.scss',
})
export class ManagerLayoutComponent {
  protected authFacade = inject(AuthFacade);

  get userInitials(): string {
    const name = this.authFacade.vm.user()?.fullName || this.authFacade.vm.user()?.email || 'U';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  get displayName(): string {
    return this.authFacade.vm.user()?.fullName || 'Manager';
  }

  logout() {
    this.authFacade.logout();
  }

  navItems = [
    { path: '/manager/dashboard', label: 'Overview',      icon: 'dashboard' },
    { path: '/manager/fields',    label: 'Fields',        icon: 'grid_view' },
    { path: '/manager/reservations', label: 'Reservations', icon: 'calendar_today' },
    { path: '/manager/analytics', label: 'Analytics',     icon: 'bar_chart' },
    { path: '/manager/settings',  label: 'Settings',      icon: 'settings' },
  ];
}
