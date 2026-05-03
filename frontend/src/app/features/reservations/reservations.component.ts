import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthStore } from '../auth/store/auth.store';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Sport } from '../../store/sports/sports.model';
import { Field } from '../../store/fields/fields.state';
import { Reservation } from '../../store/reservation/reservation.state';
import { ToastService } from '../../shared-ui/toast/yardly-toast.service';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { FieldsStore } from '../../store/fields.store';
import { SportsStore } from '../../store/sports.store';
import { ReservationsStore } from '../../store/reservations.store';

@Component({
  selector: 'app-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AsyncPipe, DatePipe, SkeletonComponent],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  private readonly authStore         = inject(AuthStore);
  private readonly fieldsStore       = inject(FieldsStore);
  private readonly sportsStore       = inject(SportsStore);
  private readonly reservationsStore = inject(ReservationsStore);

  bookingForm: FormGroup;

  currentYear!: number;
  currentMonth!: number;
  monthName!: string;

  dayNames: string[] = [
    'Luni',
    'Marti',
    'Miercuri',
    'Joi',
    'Vineri',
    'Sambata',
    'Duminica',
  ];

  calendarDays: {
    date: number;
    isCurrentMonth: boolean;
    isPast: boolean;
    isToday: boolean;
    isOpen: boolean;
  }[] = [];

  // Observables pentru template (async pipe) — convertite din signals
  readonly sports$       = toObservable(this.sportsStore.entities);
  readonly fields$       = toObservable(this.fieldsStore.entities);
  readonly slots$        = toObservable(this.reservationsStore.availableSlots);
  readonly loadingSlots$ = toObservable(this.reservationsStore.loading);

  sportsOptions$!: Observable<{ value: string; label: string; disabled?: boolean }[]>;
  fieldsOptions$!: Observable<{ value: string; label: string; disabled?: boolean }[]>;

  durationOptions: { value: string; label: string }[] = [];
  lastFields: Field[] = [];

  filteredFieldsOptions$!: Observable<{ value: string; label: string }[]>;

  isMobile = false;

  selectedDay: Date = new Date();

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      sport: [''],
      time: [''],
      field: [''],
      date: [''],
      duration: [''],
      isEvent: [false],
      isRecurrent: [false],
    });

    const initialDate = new Date();
    this.currentYear = initialDate.getFullYear();
    this.currentMonth = initialDate.getMonth();
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 576;
    }

    this.sportsOptions$ = this.sports$.pipe(
      map((sports) =>
        (sports || []).map((sport) => ({
          value: sport._id,
          label: sport.name,
        }))
      ),
      startWith([])
    );

    this.fields$.subscribe((fields) => {
      this.lastFields = fields;
    });

    this.filteredFieldsOptions$ = this.fields$.pipe(
      map((fields) =>
        fields.filter(
          (field) => field.sport === this.bookingForm.get('sport')?.value
        )
      ),
      map((filtered) =>
        filtered.map((field) => ({
          value: field._id,
          label: field.name,
        }))
      ),
      startWith([])
    );

    this.bookingForm.get('sport')?.valueChanges.subscribe((sportId) => {
      this.filterFieldsBySport(sportId);
    });

    this.sportsStore.loadSports();
    this.fieldsStore.loadFields();

    this.durationOptions = this.generateDurationOptions(5);

    this.bookingForm.get('isEvent')?.valueChanges.subscribe(() => {
      this.onEventToggle();
    });

    this.bookingForm.get('field')?.valueChanges.subscribe(() => {
      this.generateCalendar();
    });

    this.bookingForm.valueChanges.subscribe((values) => {
      if (values.field && values.date && values.duration && values.sport) {
        this.checkAvailability();
      }
    });
  }

  filterFieldsBySport(sportId: string) {
    if (!sportId) {
      this.bookingForm.get('field')?.setValue('');
      this.filteredFieldsOptions$ = this.fields$.pipe(
        map(() => []),
        startWith([])
      );
      return;
    }

    this.filteredFieldsOptions$ = this.fields$.pipe(
      map((fields) => fields.filter((field) => field.sport === sportId)),
      map((filtered) => {
        return filtered.map((field) => ({
          value: field._id,
          label: field.name,
        }));
      }),
      startWith([])
    );
  }

  generateDurationOptions(
    maxHours: number
  ): { value: string; label: string }[] {
    const durations = [];

    for (let i = 2; i <= maxHours * 2; i++) {
      const hours = Math.floor(i / 2);
      const half = i % 2 !== 0;

      const label = half
        ? `${hours} ore și jumătate`
        : `${hours === 1 ? '1 oră' : `${hours} ore`}`;

      const value = half ? `${hours}h30` : `${hours}h`;

      durations.push({ value, label });
    }

    return durations;
  }

  onEventToggle() {
    const isEvent = this.bookingForm.get('isEvent')?.value;
    const maxHours = isEvent ? 10 : 5;
    this.durationOptions = this.generateDurationOptions(maxHours);
    this.bookingForm.get('duration')?.setValue('');
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const today = new Date();
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const startDay =
      firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();

    const selectedFieldId = this.bookingForm.get('field')?.value;
    const selectedField = this.lastFields.find(
      (f) => f._id === selectedFieldId
    );
    const schedule = selectedField ? selectedField.schedule : [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, i);
      const dayName = dateObj
        .toLocaleString('ro-RO', { weekday: 'long' })
        .toLowerCase();

      const isOpen = schedule.some((s) => this.normDay(s.day) === this.normDay(dayName));

      const isPast =
        dateObj <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday =
        dateObj.getFullYear() === today.getFullYear() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getDate() === today.getDate();

      this.calendarDays.push({
        date: i,
        isCurrentMonth: true,
        isPast,
        isToday,
        isOpen,
      });
    }

    for (let i = 1; i < startDay; i++) {
      this.calendarDays.unshift({
        date: 0,
        isCurrentMonth: false,
        isPast: false,
        isToday: false,
        isOpen: false,
      });
    }

    this.monthName = new Date(
      this.currentYear,
      this.currentMonth
    ).toLocaleString('ro-RO', { month: 'long' });
  }

  onDaySelected(day: any): void {
    if (!day.isCurrentMonth || day.isPast || day.date === 0 || !day.isOpen)
      return;
    const selectedDate = new Date(
      this.currentYear,
      this.currentMonth,
      day.date
    );
    this.bookingForm.get('date')?.setValue(selectedDate);
  }

  isSelectedDay(day: any): boolean {
    const selectedDate = new Date(this.bookingForm.get('date')?.value);
    if (!selectedDate || !day.isCurrentMonth || day.date === 0) return false;

    return (
      selectedDate.getFullYear() === this.currentYear &&
      selectedDate.getMonth() === this.currentMonth &&
      selectedDate.getDate() === day.date
    );
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  reserve() {
    const userId = this.authStore.user()?._id;
    if (!userId) {
      console.warn('User not authenticated');
      return;
    }
    const formObject: Omit<Reservation, '_id' | 'slots'> = {
      user: userId,
      field: this.bookingForm.value.field,
      date: this.formatDate(this.bookingForm.value.date),
      duration: this.bookingForm.value.duration,
      time: this.bookingForm.value.time,
      isEvent: this.bookingForm.value.isEvent,
      isRecurrent: this.bookingForm.value.isRecurrent,
    };
    this.reservationsStore.createReservation(formObject);
  }

  getLabelFromOptions(
    options: { value: string; label: string }[] | null,
    value: string
  ): string {
    if (!options) return value;
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : value;
  }

  canCheckAvailability(): boolean {
    const values = this.bookingForm.value;
    return values.field && values.date && values.time;
  }

  checkAvailability() {
    const { field, date, duration } = this.bookingForm.value;
    this.reservationsStore.loadAvailableSlots({
      field,
      date: this.formatDate(date),
      duration,
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getSelectedSlot(slots: { from: string; to: string }[]): string {
    const selectedFrom = this.bookingForm.value.time;
    if (!selectedFrom) return 'Neselectat';
    const selectedSlot = slots.find((s) => s.from === selectedFrom);
    return selectedSlot
      ? `${selectedSlot.from} - ${selectedSlot.to}`
      : 'Neselectat';
  }

  prevDay() {
    this.selectedDay = new Date(this.selectedDay);
    this.selectedDay.setDate(this.selectedDay.getDate() - 1);
    this.loadSlotsForDay(this.selectedDay);
  }

  nextDay() {
    this.selectedDay = new Date(this.selectedDay);
    this.selectedDay.setDate(this.selectedDay.getDate() + 1);
    this.loadSlotsForDay(this.selectedDay);
  }

  loadSlotsForDay(day: Date) {
    const { field, duration } = this.bookingForm.value;
    console.log(day);
    this.reservationsStore.loadAvailableSlots({
      field,
      date: this.formatDate(day),
      duration,
    });
  }

  getTotalPrice(
    fields: any[],
    selectedFieldId: number,
    duration: string
  ): number {
    const field = fields.find((f) => f._id === selectedFieldId);
    if (!field) {
      return 0;
    }

    let hours = 0;

    if (typeof duration === 'string') {
      if (duration.includes('h30')) {
        hours = parseFloat(duration.replace('h30', '.5'));
      } else if (duration.includes('h')) {
        hours = parseFloat(duration.replace('h', ''));
      }
    } else {
      hours = Number(duration);
    }

    return field.pricePerHour * hours;
  }

  /** Normalizează ziua pentru comparație — elimină diferențele Unicode dintre ț/ţ, â/ă etc. */
  private normDay(s: string): string {
    return s.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip diacritice
      .replace(/[^a-z]/g, '');
  }
}
