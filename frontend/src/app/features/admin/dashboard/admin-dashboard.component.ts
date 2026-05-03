import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface CityRow {
  name: string;
  fields: number;
  activeUsers: string;
  bookings: number;
  growth: string;
}

interface ActivityItem {
  icon: string;
  iconColor: 'accent' | 'danger' | 'info';
  title: string;
  subtitle: string;
  time: string;
}

interface ApprovalItem {
  name: string;
  subtitle: string;
  approved?: boolean;
  rejected?: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}
  kpis: KpiCard[] = [
    { label: 'Total Users',  value: '12,840', change: '+12%', positive: true },
    { label: 'Managers',     value: '450',    change: '+5%',  positive: true },
    { label: 'Fields',       value: '1,200',  change: '+8%',  positive: true },
    { label: 'Bookings',     value: '8,500',  change: '+15%', positive: true },
    { label: 'Revenue',      value: '$142k',  change: '+22%', positive: true },
    { label: 'Cities',       value: '24',     change: '+2%',  positive: true },
  ];

  bookingBars = [60, 40, 85, 55, 70, 95, 80];
  bookingMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  revenueMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  topCities: CityRow[] = [
    { name: 'London',    fields: 142, activeUsers: '2,401', bookings: 850, growth: '+12.4%' },
    { name: 'New York',  fields: 98,  activeUsers: '1,892', bookings: 612, growth: '+8.1%' },
    { name: 'Barcelona', fields: 76,  activeUsers: '1,540', bookings: 490, growth: '+15.2%' },
  ];

  recentActivity: ActivityItem[] = [
    {
      icon: 'badge',
      iconColor: 'accent',
      title: 'New Manager: David Smith',
      subtitle: 'Pending verification — 3 fields',
      time: '5 minutes ago',
    },
    {
      icon: 'gavel',
      iconColor: 'danger',
      title: 'New Dispute: #DIS-2040',
      subtitle: 'Payment issue — Field: Sunset Arena',
      time: '30 minutes ago',
    },
    {
      icon: 'stadium',
      iconColor: 'accent',
      title: 'Field Approved: Camp Nou 2',
      subtitle: '1 hour ago • Barcelona',
      time: '1 hour ago',
    },
    {
      icon: 'settings',
      iconColor: 'info',
      title: 'System: Global config updated',
      subtitle: '6 hours ago • Admin Alex',
      time: '6 hours ago',
    },
  ];

  pendingApprovals: ApprovalItem[] = [
    { name: 'Field: Unity Park', subtitle: 'Manager: Al-Amin' },
    { name: 'User: Sarah W.',    subtitle: 'Pending docs' },
  ];

  kpiRoutes: string[] = [
    '/admin/users',
    '/admin/managers',
    '/admin/fields',
    '/admin/bookings',
    '/admin/finances',
    '/admin/cities',
  ];

  approve(item: ApprovalItem) { item.approved = true; item.rejected = false; }
  reject(item: ApprovalItem)  { item.rejected = true; item.approved = false; }
  goTo(path: string)          { this.router.navigate([path]); }
}
