import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface City {
  id: number;
  name: string;
  country: string;
  fields: number;
  managers: number;
  bookings: number;
  status: 'Active' | 'Audit';
  timezone: string;
  growth: number;
  activeHubs: number;
  bookingTrend: number[];
  recentActivity: { icon: string; label: string; detail: string }[];
}

@Component({
  selector: 'app-admin-cities',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-cities.component.html',
  styleUrls: ['./admin-cities.component.scss'],
})
export class AdminCitiesComponent {
  searchQuery = '';
  activeFilter: 'All Cities' | 'Active' | 'Inactive' = 'All Cities';
  selectedCity: City | null = null;

  filters = ['All Cities', 'Active', 'Inactive'] as const;

  cities: City[] = [
    {
      id: 1, name: 'London', country: 'United Kingdom', fields: 45, managers: 12,
      bookings: 1250, status: 'Active', timezone: 'GMT +0', growth: 12.5, activeHubs: 8,
      bookingTrend: [30, 45, 38, 60, 55, 70, 65],
      recentActivity: [
        { icon: 'add_circle', label: 'New Field Added', detail: 'Hyde Park Futsal was added to the platform.' },
        { icon: 'person_add', label: 'Manager Assigned', detail: 'John Davis was assigned to manage Hyde Park.' },
      ],
    },
    {
      id: 2, name: 'New York', country: 'United States', fields: 38, managers: 9,
      bookings: 980, status: 'Active', timezone: 'GMT -5', growth: 8.2, activeHubs: 6,
      bookingTrend: [20, 35, 40, 50, 48, 60, 58],
      recentActivity: [
        { icon: 'add_circle', label: 'New Field Added', detail: 'Central Park Arena was listed.' },
        { icon: 'person_add', label: 'Manager Assigned', detail: 'Maria Lopez was assigned.' },
      ],
    },
    {
      id: 3, name: 'Paris', country: 'France', fields: 22, managers: 6,
      bookings: 540, status: 'Audit', timezone: 'GMT +1', growth: -2.1, activeHubs: 4,
      bookingTrend: [25, 20, 30, 22, 28, 18, 20],
      recentActivity: [
        { icon: 'warning', label: 'Audit Initiated', detail: 'Compliance review started for 3 fields.' },
      ],
    },
    {
      id: 4, name: 'Berlin', country: 'Germany', fields: 31, managers: 8,
      bookings: 720, status: 'Active', timezone: 'GMT +1', growth: 5.7, activeHubs: 5,
      bookingTrend: [28, 32, 40, 38, 44, 50, 48],
      recentActivity: [
        { icon: 'add_circle', label: 'New Field Added', detail: 'Tiergarten Sports Hub listed.' },
        { icon: 'person_add', label: 'Manager Assigned', detail: 'Klaus Fischer was assigned.' },
      ],
    },
    {
      id: 5, name: 'Tokyo', country: 'Japan', fields: 56, managers: 14,
      bookings: 2170, status: 'Active', timezone: 'GMT +9', growth: 18.3, activeHubs: 12,
      bookingTrend: [55, 65, 70, 80, 78, 90, 88],
      recentActivity: [
        { icon: 'add_circle', label: 'New Field Added', detail: 'Shinjuku Arena added.' },
        { icon: 'star', label: 'Top City', detail: 'Tokyo ranked #1 in bookings this month.' },
      ],
    },
    {
      id: 6, name: 'Madrid', country: 'Spain', fields: 29, managers: 7,
      bookings: 630, status: 'Active', timezone: 'GMT +1', growth: 4.1, activeHubs: 5,
      bookingTrend: [22, 28, 30, 35, 33, 40, 38],
      recentActivity: [
        { icon: 'add_circle', label: 'New Field Added', detail: 'Retiro Sports Complex listed.' },
        { icon: 'person_add', label: 'Manager Assigned', detail: 'Carlos Diaz was assigned.' },
      ],
    },
  ];

  get filteredCities(): City[] {
    let list = this.cities;
    if (this.activeFilter === 'Active') list = list.filter(c => c.status === 'Active');
    if (this.activeFilter === 'Inactive') list = list.filter(c => c.status === 'Audit');
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q));
    }
    return list;
  }

  selectCity(city: City) {
    this.selectedCity = this.selectedCity?.id === city.id ? null : city;
  }

  closePanel() {
    this.selectedCity = null;
  }

  getTrendMax(): number {
    return Math.max(...(this.selectedCity?.bookingTrend ?? [1]));
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
}
