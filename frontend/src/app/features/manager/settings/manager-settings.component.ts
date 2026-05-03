import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthFacade } from '../../auth/facades/auth.facade';

@Component({
  selector: 'app-manager-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-settings.component.html',
  styleUrl: './manager-settings.component.scss',
})
export class ManagerSettingsComponent {
  private authFacade = inject(AuthFacade);

  activeTab: 'profile' | 'venue' | 'notifications' | 'billing' = 'profile';

  tabs = [
    { id: 'profile'       as const, label: 'Profile',        icon: 'person' },
    { id: 'venue'         as const, label: 'Venue',          icon: 'sports_soccer' },
    { id: 'notifications' as const, label: 'Notifications',  icon: 'notifications' },
    { id: 'billing'       as const, label: 'Billing',        icon: 'credit_card' },
  ];

  saved = signal(false);

  // Profile — populated from AuthStore
  profile = {
    fullName: '',
    email: '',
    phone: '',
    role: 'Field Manager',
    avatar: '',
  };

  // Venue
  venue = {
    name: 'Yardly Sports Complex',
    address: 'Str. Sportului 12, Cluj-Napoca',
    description: 'Premium sports fields for every sport.',
    openTime: '07:00',
    closeTime: '23:00',
    currency: 'RON',
    timezone: 'Europe/Bucharest',
  };

  // Notifications
  notifs = {
    emailBookings:   true,
    emailCancels:    true,
    emailReports:    false,
    pushBookings:    true,
    pushCancels:     false,
    smsBookings:     false,
  };

  // Billing
  plan = {
    name: 'Pro',
    price: '$49',
    period: 'month',
    nextBilling: 'Apr 27, 2026',
    seats: 5,
    usedSeats: 2,
  };

  paymentMethod = {
    brand: 'Visa',
    last4: '4242',
    expiry: '08/27',
  };

  constructor() {
    effect(() => {
      const user = this.authFacade.vm.user();
      if (user) {
        this.profile.fullName = user.username || user.fullName || '';
        this.profile.email    = user.email || '';
        this.profile.phone    = user.phone || '';
        this.profile.role     = user.role === 'manager' ? 'Field Manager' : (user.role || 'Field Manager');
      }
    });
  }

  saveSettings() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}
