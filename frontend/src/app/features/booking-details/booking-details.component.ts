import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { ReservationsStore } from '../../store/reservations.store';
import { FieldsStore } from '../../store/fields.store';
import { SportsStore } from '../../store/sports.store';
import { Reservation } from '../../store/reservation/reservation.state';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, DatePipe, SkeletonComponent],
  templateUrl: './booking-details.component.html',
  styleUrl: './booking-details.component.scss',
})
export class BookingDetailsComponent {
  private readonly route             = inject(ActivatedRoute);
  private readonly router            = inject(Router);
  private readonly reservationsStore = inject(ReservationsStore);
  private readonly fieldsStore       = inject(FieldsStore);
  private readonly sportsStore       = inject(SportsStore);

  readonly id = this.route.snapshot.paramMap.get('id')!;

  readonly reservation = computed(() =>
    this.reservationsStore.reservations().find(r => r._id === this.id) ?? null
  );

  readonly loading        = this.reservationsStore.loading;
  readonly fieldsEntities = this.fieldsStore.entityMap;
  readonly sportsEntities = this.sportsStore.entityMap;

  readonly field = computed(() => {
    const r = this.reservation();
    if (!r) return null;
    // Backend populează field ca obiect; fallback la entityMap pentru navigare directă
    if (r.field && typeof r.field === 'object') return r.field as any;
    return this.fieldsEntities()[r.field as string] ?? null;
  });

  readonly sportName = computed(() => {
    const f = this.field();
    if (!f) return '—';
    const sportId = typeof f.sport === 'object' ? f.sport?._id : f.sport;
    return this.sportsEntities()[sportId]?.name ?? sportId ?? '—';
  });

  readonly bookingStatus = computed(() => {
    const r = this.reservation();
    if (!r) return 'UNKNOWN';
    const today = new Date().toISOString().split('T')[0];
    return r.date >= today ? 'CONFIRMED' : 'COMPLETED';
  });

  get shareLink(): string {
    return `yardly.app/booking/${this.id}`;
  }

  copied = false;
  showCancelConfirm = false;

  constructor() {
    this.fieldsStore.loadFields();
    this.sportsStore.loadSports();
    if (!this.reservation()) {
      this.reservationsStore.loadReservation(this.id);
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.shareLink).catch(() => {});
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  shareNative(): void {
    if (navigator.share) {
      navigator.share({ url: this.shareLink, title: 'Join my game on Yardly!' });
    }
  }

  openMessage(): void {
    window.open(`sms:?body=Join%20me%20at%20${encodeURIComponent(this.shareLink)}`, '_blank');
  }

  addToCalendar(): void {
    const r = this.reservation();
    const f = this.field();
    if (!r) return;
    const url = this.buildGCalUrl(r, f);
    window.open(url, '_blank');
  }

  downloadReceipt(): void {
    const r = this.reservation();
    const f = this.field();
    if (!r) return;
    const html = this.buildReceiptHtml(r, f);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yardly-receipt-${r._id?.slice(-6) ?? 'booking'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  cancelBooking(): void {
    this.showCancelConfirm = true;
  }

  confirmCancel(): void {
    this.reservationsStore.deleteReservation(this.id);
    this.showCancelConfirm = false;
    this.router.navigate(['/profile']);
  }

  private buildGCalUrl(r: Reservation, field: any): string {
    const [y, m, d] = r.date.split('-').map(Number);
    const [h, min]  = r.time.split(':').map(Number);
    const start     = new Date(y, m - 1, d, h, min);

    const match = r.duration.match(/^(\d+)h(30)?$/);
    const durMin = match ? +match[1] * 60 + (match[2] ? 30 : 0) : 60;
    const end    = new Date(start.getTime() + durMin * 60_000);

    const fmt = (dt: Date) =>
      `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}${String(dt.getMinutes()).padStart(2, '0')}00`;

    const title    = encodeURIComponent(`Yardly – ${field?.name ?? 'Field Booking'}`);
    const location = encodeURIComponent(field?.address ?? field?.city ?? '');
    const details  = encodeURIComponent(`Sport: ${field?.sport ?? ''}\nDuration: ${r.duration}\nBooking ID: YR-${r._id?.slice(-6).toUpperCase()}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  }

  private buildReceiptHtml(r: Reservation, field: any): string {
    const id      = 'YR-' + (r._id?.slice(-6).toUpperCase() ?? '??????');
    const name    = field?.name ?? r.field;
    const city    = field?.city ?? '';
    const sport   = field?.sport ?? '';
    const price   = field?.pricePerHour ?? 0;
    const match   = r.duration.match(/^(\d+)h(30)?$/);
    const hours   = match ? +match[1] + (match[2] ? 0.5 : 0) : 1;
    const total   = Math.round(price * hours);

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Yardly Receipt ${id}</title>
<style>
  body{font-family:sans-serif;max-width:480px;margin:40px auto;color:#1a1a1a}
  h1{color:#1a8a2e;margin-bottom:4px}
  .sub{color:#666;margin-top:0}
  table{width:100%;border-collapse:collapse;margin:24px 0}
  td{padding:10px 0;border-bottom:1px solid #eee}
  td:last-child{text-align:right;font-weight:500}
  .total td{font-size:1.1em;font-weight:700;border-top:2px solid #1a8a2e;border-bottom:none}
  .footer{color:#888;font-size:.85em;margin-top:24px}
</style></head><body>
<h1>Yardly</h1>
<p class="sub">Booking Receipt</p>
<hr>
<table>
  <tr><td>Booking ID</td><td>${id}</td></tr>
  <tr><td>Field</td><td>${name}</td></tr>
  <tr><td>Location</td><td>${city}</td></tr>
  <tr><td>Sport</td><td>${sport}</td></tr>
  <tr><td>Date</td><td>${r.date}</td></tr>
  <tr><td>Time</td><td>${r.time}</td></tr>
  <tr><td>Duration</td><td>${r.duration}</td></tr>
  <tr><td>Price / hour</td><td>${price} RON</td></tr>
  <tr class="total"><td>Total</td><td>${total} RON</td></tr>
</table>
<p class="footer">Thank you for booking with Yardly!<br>Questions? support@yardly.app</p>
</body></html>`;
  }

  dismissCancel(): void {
    this.showCancelConfirm = false;
  }

  contactSupport(): void {
    window.open('mailto:support@yardly.app', '_blank');
  }
}
