import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  city: string;
  bookingsTotal: number;
  bookingsCancelled: number;
  noShows: number;
  status: 'active' | 'blocked';
  createdAt: string;
  initials: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent {
  searchQuery = '';
  activeFilter = signal<'all' | 'active' | 'blocked'>('all');

  users: AdminUser[] = [
    { id: '1', name: 'Alex Rivera',   email: 'alex.r@gmail.com',        city: 'New York, NY',   bookingsTotal: 48, bookingsCancelled: 2, noShows: 0, status: 'active',  createdAt: 'Jan 12, 2024', initials: 'AR' },
    { id: '2', name: 'Jordan Smith',  email: 'jordan.s@outlook.com',    city: 'New York, NY',   bookingsTotal: 12, bookingsCancelled: 0, noShows: 3, status: 'active',  createdAt: 'Feb 3, 2024',  initials: 'JS' },
    { id: '3', name: 'Casey Bloom',   email: 'casey@example.com',       city: 'Los Angeles, CA',bookingsTotal: 8,  bookingsCancelled: 5, noShows: 1, status: 'blocked', createdAt: 'Feb 20, 2024', initials: 'CB' },
    { id: '4', name: 'Riley Vance',   email: 'riley@rsmrkt.com',        city: 'Austin, TX',     bookingsTotal: 20, bookingsCancelled: 1, noShows: 0, status: 'active',  createdAt: 'Mar 5, 2024',  initials: 'RV' },
  ];

  selectedUser: AdminUser | null = null;

  get filteredUsers(): AdminUser[] {
    return this.users.filter(u => {
      const matchFilter = this.activeFilter() === 'all' ||
        (this.activeFilter() === 'active' && u.status === 'active') ||
        (this.activeFilter() === 'blocked' && u.status === 'blocked');
      const matchSearch = !this.searchQuery ||
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }

  setFilter(f: 'all' | 'active' | 'blocked') {
    this.activeFilter.set(f);
  }

  selectUser(u: AdminUser) {
    this.selectedUser = this.selectedUser?.id === u.id ? null : u;
  }

  blockUser(u: AdminUser, e: Event) {
    e.stopPropagation();
    u.status = u.status === 'active' ? 'blocked' : 'active';
  }
}
