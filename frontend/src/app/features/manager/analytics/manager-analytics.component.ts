import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './manager-analytics.component.html',
  styleUrl: './manager-analytics.component.scss',
})
export class ManagerAnalyticsComponent {
  activePeriod: 'week' | 'month' | 'year' = 'month';

  periods: { id: 'week' | 'month' | 'year'; label: string }[] = [
    { id: 'week',  label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year',  label: 'This Year' },
  ];

  stats = [
    { label: 'Total Revenue',    value: '$38,500', icon: 'payments',              trend: '+12.5%', up: true,  sub: 'vs last month' },
    { label: 'Total Bookings',   value: '284',     icon: 'event_available',        trend: '+8.3%',  up: true,  sub: 'vs last month' },
    { label: 'Avg. Booking Val', value: '$67.40',  icon: 'price_check',           trend: '+3.8%',  up: true,  sub: 'per session' },
    { label: 'Cancellation Rate',value: '4.2%',    icon: 'event_busy',            trend: '-1.1%',  up: true,  sub: 'improvement' },
  ];

  // Revenue chart — 12 months data (values as % of max for bar height)
  revenueData = [
    { label: 'Jan', value: 21400, pct: 56 },
    { label: 'Feb', value: 18900, pct: 49 },
    { label: 'Mar', value: 24300, pct: 63 },
    { label: 'Apr', value: 22100, pct: 57 },
    { label: 'May', value: 29800, pct: 77 },
    { label: 'Jun', value: 34500, pct: 90 },
    { label: 'Jul', value: 38200, pct: 99 },
    { label: 'Aug', value: 38500, pct: 100 },
    { label: 'Sep', value: 31200, pct: 81 },
    { label: 'Oct', value: 28700, pct: 74 },
    { label: 'Nov', value: 35100, pct: 91 },
    { label: 'Dec', value: 26800, pct: 70 },
  ];

  // Bookings by sport
  sportsData = [
    { sport: 'Soccer',     bookings: 132, pct: 46, color: '#39E819' },
    { sport: 'Basketball', bookings: 68,  pct: 24, color: '#f97316' },
    { sport: 'Tennis',     bookings: 51,  pct: 18, color: '#8b5cf6' },
    { sport: 'Padel',      bookings: 33,  pct: 12, color: '#06b6d4' },
  ];

  // Top fields
  topFields = [
    { name: 'Main Wembley Pitch',   sport: 'Soccer',     bookings: 58,  revenue: '$4,930', utilization: 95, trend: '+14%' },
    { name: 'Premium Padel Court 1',sport: 'Padel',      bookings: 44,  revenue: '$2,420', utilization: 84, trend: '+9%'  },
    { name: 'Court A – North Wing', sport: 'Basketball', bookings: 39,  revenue: '$1,755', utilization: 76, trend: '+5%'  },
    { name: 'East Pitch 1',         sport: 'Soccer',     bookings: 36,  revenue: '$2,160', utilization: 70, trend: '+2%'  },
    { name: 'South Court 2',        sport: 'Tennis',     bookings: 29,  revenue: '$870',   utilization: 58, trend: '-3%'  },
  ];

  // Peak hours heatmap (hours 6–22, days Mon–Sun)
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  hours = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];

  heatmap: number[][] = [
    // Mon–Sun for each hour slot
    [1, 1, 2, 1, 1, 3, 2],   // 6am
    [2, 2, 3, 2, 2, 4, 4],   // 8am
    [3, 3, 4, 3, 3, 5, 5],   // 10am
    [2, 2, 3, 2, 3, 4, 5],   // 12pm
    [2, 3, 3, 3, 4, 5, 5],   // 2pm
    [4, 4, 5, 4, 5, 5, 4],   // 4pm
    [5, 5, 5, 5, 5, 4, 3],   // 6pm
    [4, 4, 4, 4, 5, 3, 2],   // 8pm
    [2, 2, 2, 2, 3, 2, 1],   // 10pm
  ];

  heatIntensity(val: number): string {
    const map: Record<number, string> = {
      1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5',
    };
    return map[val] ?? 'h1';
  }

  sportColor(sport: string): string {
    const map: Record<string, string> = {
      Soccer: '#39E819', Basketball: '#f97316', Tennis: '#8b5cf6', Padel: '#06b6d4',
    };
    return map[sport] ?? '#39E819';
  }

  formatRevenue(val: number): string {
    return '$' + (val / 1000).toFixed(1) + 'k';
  }
}
