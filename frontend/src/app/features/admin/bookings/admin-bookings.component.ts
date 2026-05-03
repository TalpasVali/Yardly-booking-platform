import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface Booking {
  id: string;
  field: string;
  sport: string;
  user: string;
  userInitials: string;
  userEmail: string;
  dateTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  venue: string;
  venueField: string;
  price: string;
  timeline: { icon: string; label: string; time: string; done: boolean }[];
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss'],
})
export class AdminBookingsComponent {
  searchQuery = '';
  selectedBooking: Booking | null = null;

  filterStatus = 'All';
  filterCity = 'All';
  filterManager = 'All';
  filterSport = 'All';
  filterDate = 'Last 30 Days';

  statusOptions = ['All', 'Confirmed', 'Pending', 'Cancelled'];
  cityOptions = ['All', 'New York', 'Chicago', 'Miami', 'San Diego'];
  managerOptions = ['All', 'Manager A', 'Manager B'];
  sportOptions = ['All', 'Soccer', 'Basketball', 'Tennis', 'Padel'];
  dateOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'];

  bookings: Booking[] = [
    {
      id: '#RES-9411',
      field: 'Central Turf',
      sport: 'Soccer',
      user: 'Alex Rivera',
      userInitials: 'AR',
      userEmail: 'alex.rivera@example.com',
      dateTime: 'Oct 24, 14:00',
      status: 'CONFIRMED',
      venue: 'Central Sports Complex',
      venueField: 'Central Turf (Pitch 5)',
      price: '$85.00',
      timeline: [
        { icon: 'check_circle', label: 'Booking Confirmed', time: 'Oct 24, 10:00', done: true },
        { icon: 'payments', label: 'Payment Received', time: 'Oct 24, 10:01', done: true },
        { icon: 'add_circle', label: 'Reservation Created', time: 'Oct 24, 09:58', done: true },
      ],
    },
    {
      id: '#RES-9422',
      field: 'East Ocean Arena',
      sport: 'Soccer',
      user: 'Sarah Cook',
      userInitials: 'SC',
      userEmail: 'sarah.cook@example.com',
      dateTime: 'Oct 24, 19:30',
      status: 'PENDING',
      venue: 'East Ocean Sports Hub',
      venueField: 'East Ocean Arena (Main)',
      price: '$60.00',
      timeline: [
        { icon: 'hourglass_empty', label: 'Awaiting Confirmation', time: 'Oct 24, 16:00', done: false },
        { icon: 'payments', label: 'Payment Pending', time: 'Oct 24, 16:00', done: false },
        { icon: 'add_circle', label: 'Reservation Created', time: 'Oct 24, 16:00', done: true },
      ],
    },
    {
      id: '#RES-9423',
      field: 'West Arena',
      sport: 'Sport',
      user: 'Mike Ross',
      userInitials: 'MR',
      userEmail: 'mike.ross@example.com',
      dateTime: 'Oct 25, 09:00',
      status: 'CANCELLED',
      venue: 'West Side Arena',
      venueField: 'West Arena (Court 1)',
      price: '$45.00',
      timeline: [
        { icon: 'cancel', label: 'Booking Cancelled', time: 'Oct 24, 22:00', done: true },
        { icon: 'payments', label: 'Refund Initiated', time: 'Oct 24, 22:05', done: true },
        { icon: 'add_circle', label: 'Reservation Created', time: 'Oct 24, 20:00', done: true },
      ],
    },
    {
      id: '#RES-9524',
      field: 'South Sports Hub',
      sport: 'Padel',
      user: 'Leo Messi',
      userInitials: 'LM',
      userEmail: 'leo.messi@example.com',
      dateTime: 'Oct 25, 11:00',
      status: 'CONFIRMED',
      venue: 'South Sports Hub',
      venueField: 'South Hub (Padel Court 2)',
      price: '$95.00',
      timeline: [
        { icon: 'check_circle', label: 'Booking Confirmed', time: 'Oct 25, 08:00', done: true },
        { icon: 'payments', label: 'Payment Received', time: 'Oct 25, 08:01', done: true },
        { icon: 'add_circle', label: 'Reservation Created', time: 'Oct 25, 07:55', done: true },
      ],
    },
  ];

  get filteredBookings(): Booking[] {
    let list = this.bookings;
    if (this.filterStatus !== 'All') {
      const s = this.filterStatus.toUpperCase();
      list = list.filter(b => b.status === s);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(b =>
        b.id.toLowerCase().includes(q) ||
        b.field.toLowerCase().includes(q) ||
        b.user.toLowerCase().includes(q)
      );
    }
    return list;
  }

  selectBooking(booking: Booking) {
    this.selectedBooking = this.selectedBooking?.id === booking.id ? null : booking;
  }

  closePanel() {
    this.selectedBooking = null;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'badge-confirmed',
      PENDING: 'badge-pending',
      CANCELLED: 'badge-cancelled',
    };
    return map[status] ?? '';
  }
}
