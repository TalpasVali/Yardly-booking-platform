import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FieldsStore } from '../../../store/fields.store';
import { ReservationsStore } from '../../../store/reservations.store';
import { AuthStore } from '../../auth/store/auth.store';
import { Field } from '../../../store/fields/fields.state';

interface PopulatedUser {
  _id: string;
  username: string;
  email: string;
}

interface PopulatedField {
  _id: string;
  name: string;
  sport: string;
  pricePerHour: number;
}

interface PopulatedReservation {
  _id?: string;
  field: PopulatedField | string;
  user: PopulatedUser | string;
  date: string;
  time: string;
  duration: string;
}

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
})
export class ManagerDashboardComponent implements OnInit {
  private fieldsStore = inject(FieldsStore);
  private reservationsStore = inject(ReservationsStore);
  private authStore = inject(AuthStore);

  constructor(private router: Router) {}

  // Stats — revenue/utilization require analytics API, kept as informational placeholders
  stats = [
    { label: 'Revenue Today',    value: '$1,240',  icon: 'payments',              trend: '+12.5%', up: true },
    { label: 'Revenue Month',    value: '$38,500', icon: 'account_balance_wallet', trend: '+5.2%',  up: true },
    { label: 'Bookings Today',   value: '12',      icon: 'event_available',        trend: '-2.4%',  up: false },
    { label: 'Utilization Rate', value: '84%',     icon: 'query_stats',           trend: '+8.1%',  up: true },
  ];

  quickActions = [
    { label: 'Add New Field',      icon: 'add_box',       route: '/manager/field-editor' },
    { label: 'Invite Staff',       icon: 'person_add',    route: null },
    { label: 'Duplicate Schedule', icon: 'content_copy',  route: null },
    { label: 'Export Reports',     icon: 'download',      route: '/manager/analytics' },
  ];

  // Last 5 reservations mapped for display
  reservations = computed(() =>
    (this.reservationsStore.reservations() as PopulatedReservation[])
      .slice(-5)
      .reverse()
      .map(r => {
        const user = typeof r.user === 'object' && r.user !== null ? r.user as PopulatedUser : { username: 'Unknown', email: '', _id: '' };
        const field = typeof r.field === 'object' && r.field !== null ? r.field as PopulatedField : { name: 'Unknown', sport: '', pricePerHour: 0, _id: '' };
        const hours = this.parseDurationHours(r.duration);
        const amount = '$' + Math.round(field.pricePerHour * hours);
        const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
        return {
          initials,
          name: user.username,
          field: field.name,
          time: r.date + ', ' + r.time,
          status: 'confirmed' as const,
          amount,
        };
      })
  );

  // Manager's fields for the summary panel
  fields = computed(() => {
    const userId = this.authStore.user()?._id;
    const all = this.fieldsStore.entities();
    const mine = userId ? all.filter(f => f.manager?._id === userId) : all;
    return mine.slice(0, 2).map(f => ({
      name: f.name,
      sub: f.sport + (f.city ? ' • ' + f.city : ''),
      utilization: f.averageRating,
      image: f.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80',
    }));
  });

  ngOnInit() {
    this.fieldsStore.loadFields();
    this.reservationsStore.loadReservations();
  }

  goTo(route: string | null) {
    if (route) this.router.navigate([route]);
  }

  private parseDurationHours(d: string): number {
    const match = d.match(/(\d+)h(30)?/);
    if (!match) return 1;
    const h = parseInt(match[1], 10);
    const m = match[2] ? 30 : 0;
    return h + m / 60;
  }
}
