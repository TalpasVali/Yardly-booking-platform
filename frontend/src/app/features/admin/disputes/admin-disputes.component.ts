import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface Dispute {
  id: string;
  fieldName: string;
  user: string;
  userInitials: string;
  type: string;
  status: 'CONFIRMED' | 'PENDING' | 'REVIEWING' | 'RESOLVED';
  complaintDescription: string;
  managerResponse: string;
  timeline: { label: string; done: boolean }[];
}

@Component({
  selector: 'app-admin-disputes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-disputes.component.html',
  styleUrls: ['./admin-disputes.component.scss'],
})
export class AdminDisputesComponent {
  searchQuery = '';
  activeFilter = 'All Disputes';
  selectedDispute: Dispute | null = null;

  filters = ['All Disputes', 'Open', 'Reviewing', 'Resolved', 'All Types'];

  disputes: Dispute[] = [
    {
      id: '#DIS-2612',
      fieldName: 'Skyline Indoor Arena',
      user: 'Sarah Miller',
      userInitials: 'SM',
      type: 'Booking Conflict',
      status: 'CONFIRMED',
      complaintDescription: 'The booking was for 7:00 PM to 9:00 PM. Upon arrival at 6:55 PM, the field manager informed us the field was double-booked and we couldn\'t play. I requested a refund on-site but was told to contact platform admin. We were 12 people waiting.',
      managerResponse: '"There was an error on our local booking terminal which allowed a walk-in during the same slot Sarah had booked online. We apologize for the inconvenience and support a full refund."',
      timeline: [
        { label: 'Dispute Filed', done: true },
        { label: 'Manager Response Logged', done: true },
        { label: 'Waiting for Admin Action', done: false },
      ],
    },
    {
      id: '#DIS-2513',
      fieldName: 'The Turf Palace',
      user: 'John Doe',
      userInitials: 'JD',
      type: 'Refund Request',
      status: 'REVIEWING',
      complaintDescription: 'Field was closed on arrival despite confirmed booking. No notification was sent beforehand.',
      managerResponse: 'We had an emergency maintenance issue. Refund has been processed.',
      timeline: [
        { label: 'Dispute Filed', done: true },
        { label: 'Manager Response Logged', done: true },
        { label: 'Waiting for Admin Action', done: false },
      ],
    },
    {
      id: '#DIS-2414',
      fieldName: 'Green Valley Park',
      user: 'Mike Ross',
      userInitials: 'MR',
      type: 'Quality Issue',
      status: 'PENDING',
      complaintDescription: 'The field surface was in terrible condition. Dangerous potholes and uneven turf that caused an injury.',
      managerResponse: 'Under review — maintenance team being dispatched.',
      timeline: [
        { label: 'Dispute Filed', done: true },
        { label: 'Manager Response Logged', done: false },
        { label: 'Waiting for Admin Action', done: false },
      ],
    },
    {
      id: '#DIS-2315',
      fieldName: 'Elite Sports Hub',
      user: 'Anna King',
      userInitials: 'AK',
      type: 'No Show',
      status: 'RESOLVED',
      complaintDescription: 'Manager never showed up to open the facility for our group booking.',
      managerResponse: 'Full refund issued. Manager has been warned.',
      timeline: [
        { label: 'Dispute Filed', done: true },
        { label: 'Manager Response Logged', done: true },
        { label: 'Resolved', done: true },
      ],
    },
  ];

  get filteredDisputes(): Dispute[] {
    let list = this.disputes;
    if (this.activeFilter === 'Open') list = list.filter(d => d.status === 'PENDING');
    if (this.activeFilter === 'Reviewing') list = list.filter(d => d.status === 'REVIEWING');
    if (this.activeFilter === 'Resolved') list = list.filter(d => d.status === 'RESOLVED');
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(d =>
        d.id.toLowerCase().includes(q) ||
        d.fieldName.toLowerCase().includes(q) ||
        d.user.toLowerCase().includes(q)
      );
    }
    return list;
  }

  selectDispute(dispute: Dispute) {
    this.selectedDispute = this.selectedDispute?.id === dispute.id ? null : dispute;
  }

  closePanel() {
    this.selectedDispute = null;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED: 'badge-confirmed',
      PENDING: 'badge-pending',
      REVIEWING: 'badge-reviewing',
      RESOLVED: 'badge-resolved',
    };
    return map[status] ?? '';
  }
}
