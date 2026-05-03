import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FieldsStore } from '../../../store/fields.store';
import { AuthStore } from '../../auth/store/auth.store';
import { Field } from '../../../store/fields/fields.state';

@Component({
  selector: 'app-manager-fields',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './manager-fields.component.html',
  styleUrl: './manager-fields.component.scss',
})
export class ManagerFieldsComponent implements OnInit {
  private fieldsStore = inject(FieldsStore);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  viewMode: 'grid' | 'list' = 'grid';

  loading = this.fieldsStore.loading;

  managerFields = computed(() => {
    const userId = this.authStore.user()?._id;
    const all = this.fieldsStore.entities();
    if (!userId) return all;
    return all.filter(f => f.manager?._id === userId);
  });

  private avgRating = computed(() => {
    const fields = this.managerFields();
    if (!fields.length) return '0.0';
    const avg = fields.reduce((sum, f) => sum + (f.averageRating || 0), 0) / fields.length;
    return avg.toFixed(1);
  });

  private activeCount = computed(() =>
    this.managerFields().filter(f => f.status === 'active' || f.status === '').length
  );

  stats = computed(() => [
    { label: 'Total Fields',     value: this.managerFields().length.toString(), icon: 'grid_view',       sub: 'Your fields' },
    { label: 'Avg. Rating',      value: this.avgRating() + ' / 5',             icon: 'star',            sub: 'Across all fields' },
    { label: 'Active Fields',    value: this.activeCount().toString(),          icon: 'event_available', sub: 'Currently active' },
    { label: 'Field Revenue',    value: '$4,280',                               icon: 'payments',        sub: 'Last 7 days' },
  ]);

  sportColors: Record<string, string> = {
    Soccer: '#39E819',
    Basketball: '#f97316',
    Tennis: '#8b5cf6',
    Padel: '#06b6d4',
    Volleyball: '#eab308',
    Badminton: '#ec4899',
  };

  ngOnInit() {
    this.fieldsStore.loadFields();
  }

  getFieldImage(field: Field): string {
    return field.images?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80';
  }

  getSportColor(sport: string): string {
    return this.sportColors[sport] || '#39E819';
  }

  goToFieldEditor() {
    this.router.navigate(['/manager/field-editor']);
  }
}
