import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationsStore } from '../../../store/reservations.store';
import { FieldsStore } from '../../../store/fields.store';
import { AuthStore } from '../../auth/store/auth.store';

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed';

interface PopulatedUser {
  _id: string;
  username: string;
  email: string;
  phone?: string;
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
  slots?: { from: string; to: string }[];
}

interface DisplayReservation {
  id: string;
  initials: string;
  name: string;
  email: string;
  field: string;
  sport: string;
  date: string;
  time: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

@Component({
  selector: 'app-manager-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-reservations.component.html',
  styleUrl: './manager-reservations.component.scss',
})
export class ManagerReservationsComponent implements OnInit {
  private reservationsStore = inject(ReservationsStore);
  private fieldsStore = inject(FieldsStore);
  private authStore = inject(AuthStore);

  searchQuery = '';
  activeFilter: StatusFilter = 'all';
  selectedField = 'all';

  loading = this.reservationsStore.loading;

  reservations = computed((): DisplayReservation[] =>
    (this.reservationsStore.reservations() as PopulatedReservation[]).map(r =>
      this.toDisplay(r)
    )
  );

  // Fields that belong to this manager (for the filter dropdown)
  availableFields = computed(() => {
    const userId = this.authStore.user()?._id;
    const all = this.fieldsStore.entities();
    if (!userId) return all;
    return all.filter(f => f.manager?._id === userId);
  });

  stats = computed(() => {
    const all = this.reservations();
    return [
      { label: 'Total Reservations', value: all.length.toString(),      icon: 'event_available', sub: 'This month',      up: true,  trend: '' },
      { label: 'Confirmed',          value: all.length.toString(),       icon: 'check_circle',    sub: 'Active bookings', up: true,  trend: '' },
      { label: 'Pending Approval',   value: '0',                        icon: 'pending',         sub: 'Awaiting action', up: false, trend: '' },
      { label: 'Monthly Revenue',    value: '$' + this.totalRevenue(),  icon: 'payments',        sub: 'Last 30 days',   up: true,  trend: '' },
    ];
  });

  private totalRevenue = computed(() => {
    const total = this.reservations().reduce((sum, r) => sum + r.amount, 0);
    return total.toLocaleString();
  });

  filters: { id: StatusFilter; label: string }[] = [
    { id: 'all',       label: 'All' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'pending',   label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  get filteredReservations(): DisplayReservation[] {
    return this.reservations().filter(r => {
      const matchesStatus = this.activeFilter === 'all' || r.status === this.activeFilter;
      const matchesField  = this.selectedField === 'all' || r.field === this.selectedField;
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.field.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
      return matchesStatus && matchesField && matchesSearch;
    });
  }

  get countByStatus() {
    const all = this.reservations();
    return {
      all:       all.length,
      confirmed: all.length,
      pending:   0,
      completed: 0,
      cancelled: 0,
    };
  }

  ngOnInit() {
    this.reservationsStore.loadReservations();
    this.fieldsStore.loadFields();
  }

  setFilter(f: StatusFilter) { this.activeFilter = f; }

  formatDuration(d: string): string {
    const match = d.match(/(\d+)h(30)?/);
    if (!match) return d;
    const h = parseInt(match[1], 10);
    const m = match[2] ? 30 : 0;
    if (h === 0) return `${m}m`;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  private toDisplay(r: PopulatedReservation): DisplayReservation {
    const user = typeof r.user === 'object' && r.user !== null
      ? r.user as PopulatedUser
      : { username: 'Unknown', email: '', _id: '' };
    const field = typeof r.field === 'object' && r.field !== null
      ? r.field as PopulatedField
      : { name: 'Unknown Field', sport: '', pricePerHour: 0, _id: '' };

    const hours = this.parseDurationHours(r.duration);
    const amount = Math.round(field.pricePerHour * hours);
    const initials = user.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return {
      id: r._id || '',
      initials,
      name: user.username,
      email: user.email,
      field: field.name,
      sport: field.sport,
      date: r.date,
      time: r.time,
      duration: r.duration,
      status: 'confirmed',
      amount,
    };
  }

  private parseDurationHours(d: string): number {
    const match = d.match(/(\d+)h(30)?/);
    if (!match) return 1;
    const h = parseInt(match[1], 10);
    const m = match[2] ? 30 : 0;
    return h + m / 60;
  }
}
