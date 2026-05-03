import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AuthFacade } from '../auth/facades/auth.facade';
import { AuthStore } from '../auth/store/auth.store';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { ReservationsStore } from '../../store/reservations.store';
import { FieldsStore } from '../../store/fields.store';
import { Reservation } from '../../store/reservation/reservation.state';
import { ImageUrlPipe } from '../../core/pipe/image.pipe';

type TabId = 'upcoming' | 'history' | 'reviews' | 'favorites';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TitleCasePipe, SkeletonComponent, ImageUrlPipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  protected readonly authFacade        = inject(AuthFacade);
  private readonly authStore           = inject(AuthStore);
  private readonly reservationsStore   = inject(ReservationsStore);
  private readonly fieldsStore         = inject(FieldsStore);

  readonly activeTab = signal<TabId>('upcoming');

  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'upcoming',  label: 'Upcoming Bookings' },
    { id: 'history',   label: 'Booking History' },
    { id: 'reviews',   label: 'Reviews' },
    { id: 'favorites', label: 'Favorites' },
  ];

  // ─── Store slices ────────────────────────────────────────────────────────────
  readonly reservations   = this.reservationsStore.reservations;
  readonly fieldsEntities = this.fieldsStore.entityMap;
  readonly loading        = this.reservationsStore.loading;

  // ─── Computed ────────────────────────────────────────────────────────────────
  readonly myReservations = computed(() => this.reservations());

  private isInPast(r: Reservation): boolean {
    const now = new Date();
    const [year, month, day] = r.date.split('-').map(Number);
    const [hour, minute] = (r.time ?? '00:00').split(':').map(Number);
    const reservationStart = new Date(year, month - 1, day, hour, minute);
    return reservationStart < now;
  }

  readonly upcomingBookings = computed(() =>
    this.myReservations().filter(r => !this.isInPast(r))
  );

  readonly historyBookings = computed(() =>
    this.myReservations().filter(r => this.isInPast(r))
  );

  readonly filteredBookings = computed(() => {
    if (this.activeTab() === 'upcoming') return this.upcomingBookings();
    if (this.activeTab() === 'history')  return this.historyBookings();
    return [];
  });

  readonly stats = computed(() => [
    { label: 'Total Bookings', value: String(this.myReservations().length),   icon: 'event_available' },
    { label: 'Hours Played',   value: this.calcHoursPlayed(),                  icon: 'timer' },
    { label: 'Member Level',   value: 'Gold',                                  icon: 'workspace_premium' },
  ]);

  constructor() {
    this.reservationsStore.loadMyReservations();
    this.fieldsStore.loadFields();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  /** field poate fi string (ObjectId) sau obiect populat din backend */
  getFieldName(field: any): string {
    if (field && typeof field === 'object') return field.name || '—';
    return this.fieldsEntities()[field as string]?.name || '—';
  }

  getFieldCity(field: any): string {
    if (field && typeof field === 'object') return field.address || '—';
    return this.fieldsEntities()[field as string]?.address || '—';
  }

  getFieldId(field: any): string {
    if (field && typeof field === 'object') return field._id || '';
    return field as string;
  }

  getBookingStatus(r: Reservation): 'upcoming' | 'completed' {
    return this.isInPast(r) ? 'completed' : 'upcoming';
  }

  setTab(tab: TabId) {
    this.activeTab.set(tab);
  }

  get userInitials(): string {
    const name = this.authFacade.vm.user()?.fullName || this.authFacade.vm.user()?.email || 'U';
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  get displayName(): string {
    return this.authFacade.vm.user()?.fullName || this.authFacade.vm.user()?.email || 'Yardly User';
  }

  private calcHoursPlayed(): string {
    const total = this.historyBookings().reduce((sum, r) => {
      const d = r.duration ?? '';
      if (d.includes('h30')) return sum + parseFloat(d.replace('h30', '.5'));
      if (d.includes('h'))   return sum + parseFloat(d.replace('h', ''));
      return sum;
    }, 0);
    return String(Math.round(total));
  }
}
