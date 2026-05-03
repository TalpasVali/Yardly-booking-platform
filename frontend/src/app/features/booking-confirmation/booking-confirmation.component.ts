import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReservationsStore } from '../../store/reservations.store';
import { FieldsStore } from '../../store/fields.store';
import { SportsStore } from '../../store/sports.store';
import { Reservation } from '../../store/reservation/reservation.state';
import { ImageUrlPipe } from '../../core/pipe/image.pipe';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, DatePipe, ImageUrlPipe],
  templateUrl: './booking-confirmation.component.html',
  styleUrl: './booking-confirmation.component.scss',
})
export class BookingConfirmationComponent {
  private readonly reservationsStore = inject(ReservationsStore);
  private readonly fieldsStore       = inject(FieldsStore);
  private readonly sportsStore       = inject(SportsStore);

  readonly reservation    = this.reservationsStore.selectedReservation;
  readonly fieldsEntities = this.fieldsStore.entityMap;
  readonly sportsEntities = this.sportsStore.entityMap;

  readonly field = computed(() => {
    const r = this.reservation();
    if (!r) return null;
    if (r.field && typeof r.field === 'object') return r.field as any;
    return this.fieldsEntities()[r.field as string] ?? null;
  });

  readonly sportName = computed(() => {
    const f = this.field();
    if (!f) return '—';
    const sportId = typeof f.sport === 'object' ? f.sport?._id : f.sport;
    return this.sportsEntities()[sportId]?.name ?? sportId ?? '—';
  });

  readonly bookingId = computed(() => {
    const r = this.reservation();
    return r?._id ? 'YR-' + r._id.slice(-6).toUpperCase() : 'YR-??????';
  });

  constructor() {
    // Asigură că avem datele terenului și sportului disponibile
    this.fieldsStore.loadFields();
    this.sportsStore.loadSports();
  }

  get shareLink(): string {
    const r = this.reservation();
    return r?._id ? `yardly.app/booking/${r._id}` : 'yardly.app';
  }

  copied = false;

  copyLink(): void {
    navigator.clipboard.writeText(this.shareLink).catch(() => {});
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  shareWhatsApp(): void {
    window.open(`https://wa.me/?text=Join%20me%20at%20${encodeURIComponent(this.shareLink)}`, '_blank');
  }

  shareMessenger(): void {
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(this.shareLink)}`, '_blank');
  }

  addToCalendar(): void {
    const r = this.reservation();
    const f = this.field();
    if (!r) return;
    window.open(this.buildGCalUrl(r, f), '_blank');
  }

  private buildGCalUrl(r: Reservation, field: any): string {
    const [y, m, d] = r.date.split('-').map(Number);
    const [h, min]  = r.time.split(':').map(Number);
    const start     = new Date(y, m - 1, d, h, min);

    const match  = r.duration.match(/^(\d+)h(30)?$/);
    const durMin = match ? +match[1] * 60 + (match[2] ? 30 : 0) : 60;
    const end    = new Date(start.getTime() + durMin * 60_000);

    const fmt = (dt: Date) =>
      `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}${String(dt.getMinutes()).padStart(2, '0')}00`;

    const title    = encodeURIComponent(`Yardly – ${field?.name ?? 'Field Booking'}`);
    const location = encodeURIComponent(field?.address ?? field?.city ?? '');
    const details  = encodeURIComponent(`Sport: ${field?.sport ?? ''}\nDuration: ${r.duration}\nBooking ID: YR-${r._id?.slice(-6).toUpperCase()}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  }
}
