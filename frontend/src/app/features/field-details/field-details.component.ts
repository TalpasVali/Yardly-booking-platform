import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgStyle, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ImageUrlPipe } from '../../core/pipe/image.pipe';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { EntityNamePipe } from '../../core/pipe/entityName.pipe';
import { Schedule } from '../../store/fields/fields.state';
import { FieldsStore } from '../../store/fields.store';
import { ReservationsService } from '../../core/services/reservation.service';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-field-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgStyle, CurrencyPipe, DatePipe, ImageUrlPipe, EntityNamePipe, RouterModule, SkeletonComponent],
  templateUrl: './field-details.component.html',
  styleUrls: ['./field-details.component.scss'],
})
export class FieldDetailsComponent implements OnInit {
  private readonly route            = inject(ActivatedRoute);
  private readonly fieldsStore      = inject(FieldsStore);
  private readonly reservationsSvc  = inject(ReservationsService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  readonly field         = computed(() => this.fieldsStore.entityMap()[this.id]);
  readonly relatedFields = computed(() =>
    Object.values(this.fieldsStore.entityMap()).filter(f => f._id !== this.id).slice(0, 4)
  );

  // Calendar state
  readonly calendarDate   = signal(new Date());
  readonly selectedDate   = signal<Date | null>(null);
  readonly calendarDays   = computed(() => this.buildCalendarDays(this.calendarDate()));
  readonly monthLabel     = computed(() => {
    const d = this.calendarDate();
    return d.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
  });

  // Time slots state
  readonly availableSlots = signal<{ from: string; to: string }[]>([]);
  readonly selectedSlot   = signal<string | null>(null);
  readonly loadingSlots   = signal(false);
  readonly duration       = '1h';

  // Facility icon map
  readonly facilityIcons: Record<string, string> = {
    'parcare':               'local_parking',
    'vestiar':               'checkroom',
    'duș':                   'shower',
    'dușuri':                'shower',
    'dus':                   'shower',
    'iluminat nocturn':      'lightbulb',
    'bar':                   'local_bar',
    'cafenea':               'local_cafe',
    'wifi':                  'wifi',
    'tribună':               'event_seat',
    'tribuna':               'event_seat',
    'aer condiționat':       'ac_unit',
    'climatizare':           'ac_unit',
    'închiriere echipament': 'sports',
  };

  constructor() {
    if (!this.field()) {
      this.fieldsStore.loadFields();
    }
  }

  ngOnInit() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.selectDate(today);
  }

  buildCalendarDays(base: Date): CalendarDay[] {
    const year  = base.getFullYear();
    const month = base.getMonth();
    const today = new Date(); today.setHours(0,0,0,0);

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    const days: CalendarDay[] = [];

    // Leading days from prev month (start week on Monday)
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, day: d.getDate(), isCurrentMonth: false, isPast: d < today });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date, day: d, isCurrentMonth: true, isPast: date < today });
    }

    // Trailing days
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const date = new Date(year, month + 1, d);
        days.push({ date, day: d, isCurrentMonth: false, isPast: false });
      }
    }

    return days;
  }

  prevMonth() {
    const d = this.calendarDate();
    this.calendarDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.calendarDate();
    this.calendarDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  selectDate(date: Date) {
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.loadSlots(date);
  }

  isSelectedDate(day: CalendarDay): boolean {
    const sel = this.selectedDate();
    if (!sel) return false;
    return day.date.toDateString() === sel.toDateString();
  }

  isToday(day: CalendarDay): boolean {
    return day.date.toDateString() === new Date().toDateString();
  }

  private loadSlots(date: Date) {
    const field = this.field();
    if (!field) return;
    const dateStr = date.toISOString().split('T')[0];
    this.loadingSlots.set(true);
    this.availableSlots.set([]);
    this.reservationsSvc.getAvailableSlots(field._id, dateStr, this.duration).subscribe({
      next:  slots => { this.availableSlots.set(slots); this.loadingSlots.set(false); },
      error: ()    => { this.availableSlots.set([]); this.loadingSlots.set(false); },
    });
  }

  selectSlot(slot: string) {
    this.selectedSlot.set(slot);
  }

  getFacilityIcon(facility: string): string {
    return this.facilityIcons[facility.toLowerCase()] ?? 'check_circle';
  }

  get serviceFee(): number {
    const f = this.field();
    return f ? Math.round(f.pricePerHour * 0.07 * 100) / 100 : 0;
  }

  get total(): number {
    const f = this.field();
    return f ? f.pricePerHour + this.serviceFee : 0;
  }

  getScheduleLabel(schedule: Schedule[]): string {
    if (!schedule?.length) return 'Program indisponibil';
    const first = schedule[0];
    const sameHours = schedule.every(s => s.from === first.from && s.to === first.to);
    return sameHours ? `${first.from} – ${first.to}` : 'Program variabil';
  }

  readonly weekDays = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'];
}
