import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface PendingField {
  id: number;
  name: string;
  price: number;
  city: string;
  state: string;
  owner: string;
  type: string;
  submittedAgo: string;
  approved?: boolean;
  rejected?: boolean;
}

export interface InventoryField {
  id: number;
  name: string;
  sport: string;
  city: string;
  imageColor: string;
}

@Component({
  selector: 'app-admin-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-fields.component.html',
  styleUrls: ['./admin-fields.component.scss'],
})
export class AdminFieldsComponent {
  searchQuery = '';
  selectedField: InventoryField | null = null;

  pendingFields: PendingField[] = [
    { id: 1, name: 'Downtown Futbol Hub', price: 45, city: 'Chicago', state: 'IL', owner: 'Sarah Miller', type: '5-a-side Turf', submittedAgo: '2h ago' },
    { id: 2, name: 'Elite Racket Club', price: 0, city: 'Austin', state: 'TX', owner: 'James Kovic', type: '2x Hard Court', submittedAgo: '5h ago' },
  ];

  inventoryFields: InventoryField[] = [
    { id: 1, name: 'Central Park Soccer', sport: 'Football', city: 'New York', imageColor: '#1a3a1a' },
    { id: 2, name: 'Lakeside Hoops', sport: 'Basketball', city: 'Chicago', imageColor: '#2a1a3a' },
    { id: 3, name: 'Sunset Beach Volleyball', sport: 'Volleyball', city: 'Miami', imageColor: '#3a2a1a' },
    { id: 4, name: 'Rooftop Padel X', sport: 'Padel', city: 'San Diego', imageColor: '#1a2a3a' },
    { id: 5, name: 'Skyline Tennis Academy', sport: 'Tennis', city: 'Phoenix', imageColor: '#2a3a1a' },
  ];

  venueFacilities = ['Locker Rooms', 'Free Parking', 'Night Lights', 'Snack Bar'];
  facilityIcons = ['door_front', 'local_parking', 'light_mode', 'restaurant'];

  galleryColors = ['#0d2a0d', '#1a3520', '#0a1e0a', '#153015'];

  approve(field: PendingField) {
    field.approved = true;
    field.rejected = false;
  }

  reject(field: PendingField) {
    field.rejected = true;
    field.approved = false;
  }

  selectField(field: InventoryField) {
    this.selectedField = this.selectedField?.id === field.id ? null : field;
  }

  closePanel() {
    this.selectedField = null;
  }

  get pendingCount(): number {
    return this.pendingFields.filter(f => !f.approved && !f.rejected).length;
  }

  get filteredInventory(): InventoryField[] {
    if (!this.searchQuery.trim()) return this.inventoryFields;
    const q = this.searchQuery.toLowerCase();
    return this.inventoryFields.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.sport.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q)
    );
  }

  getSportIcon(sport: string): string {
    const map: Record<string, string> = {
      Football: 'sports_soccer',
      Basketball: 'sports_basketball',
      Volleyball: 'sports_volleyball',
      Padel: 'sports_tennis',
      Tennis: 'sports_tennis',
    };
    return map[sport] ?? 'stadium';
  }
}
