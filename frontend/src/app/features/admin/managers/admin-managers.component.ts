import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PendingManager {
  id: string;
  name: string;
  fieldsCount: number;
  docStatus: { label: string; verified: boolean }[];
  initials: string;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  location: string;
  fields: number;
  bookings: number;
  revenue: string;
  initials: string;
}

interface ManagerProfile {
  name: string;
  tier: string;
  initials: string;
  fieldUtilization: number;
  activeFields: number;
  managedFields: { name: string; sport: string; revenue: string }[];
  recentActivity: string[];
}

@Component({
  selector: 'app-admin-managers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-managers.component.html',
  styleUrl: './admin-managers.component.scss',
})
export class AdminManagersComponent {
  searchQuery = '';

  pendingManagers: PendingManager[] = [
    {
      id: 'p1', name: 'Alex Rivera', fieldsCount: 4, initials: 'AR',
      docStatus: [
        { label: 'Business License', verified: true },
        { label: 'Identity Proof', verified: true },
      ],
    },
    {
      id: 'p2', name: 'Jordan Smith', fieldsCount: 2, initials: 'JS',
      docStatus: [
        { label: 'Insurance Docs', verified: true },
        { label: 'Address Verification', verified: false },
      ],
    },
    {
      id: 'p3', name: 'Taylor Chen', fieldsCount: 3, initials: 'TC',
      docStatus: [
        { label: 'Business Registry', verified: true },
        { label: 'Court Affiliation', verified: false },
      ],
    },
  ];

  managers: Manager[] = [
    { id: '1', name: 'Marco Hernandez', email: 'marco@yardly.com',    location: 'San Diego, CA', fields: 12, bookings: 1452, revenue: '$45.2k', initials: 'MH' },
    { id: '2', name: 'Sarah Jenkins',   email: 'sarahj@yardly.com',   location: 'Chicago, IL',   fields: 4,  bookings: 238,  revenue: '$8.4k',  initials: 'SJ' },
    { id: '3', name: 'Michael Chang',   email: 'mchang@yardly.com',   location: 'Denver, CO',    fields: 0,  bookings: 0,    revenue: '$0.00',  initials: 'MC' },
    { id: '4', name: 'Lisa Wong',       email: 'lisawong@yardly.com',  location: 'Portland, OR',  fields: 8,  bookings: 920,  revenue: '$29.7k', initials: 'LW' },
  ];

  selectedProfile: ManagerProfile | null = {
    name: 'Marco Hernandez',
    tier: 'Elite Partner',
    initials: 'MH',
    fieldUtilization: 88,
    activeFields: 12,
    managedFields: [
      { name: 'South Beach Turf A', sport: 'Football',      revenue: '$150/h' },
      { name: 'Padel Center Court', sport: 'Padel',          revenue: '$85/h'  },
      { name: 'Downtown Arena',     sport: 'Basketball',     revenue: '$110/h' },
    ],
    recentActivity: [
      'Added new field "Clay Court 4"',
      'Updated pricing for Night Sessions',
    ],
  };

  get filteredManagers(): Manager[] {
    return this.managers.filter(m =>
      !this.searchQuery ||
      m.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectManager(m: Manager) {
    this.selectedProfile = {
      name: m.name,
      tier: 'Partner',
      initials: m.initials,
      fieldUtilization: Math.floor(Math.random() * 40) + 60,
      activeFields: m.fields,
      managedFields: [],
      recentActivity: [],
    };
  }

  approveManager(m: PendingManager, e: Event) {
    e.stopPropagation();
    this.pendingManagers = this.pendingManagers.filter(p => p.id !== m.id);
  }
}
