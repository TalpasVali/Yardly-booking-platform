import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardComponent } from '../../shared-ui/card/card.component';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { FieldsStore } from '../../store/fields.store';
import { SportsStore } from '../../store/sports.store';
import { CitiesStore } from '../../store/cities.store';

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-fields-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, SkeletonComponent],
  templateUrl: './fields-list.component.html',
  styleUrls: ['./fields-list.component.scss'],
})
export class FieldsListComponent {
  private readonly router      = inject(Router);
  private readonly fieldsStore = inject(FieldsStore);
  private readonly sportsStore = inject(SportsStore);
  private readonly citiesStore = inject(CitiesStore);

  readonly fields  = this.fieldsStore.entities;
  readonly sports  = this.sportsStore.entities;
  readonly cities  = this.citiesStore.entities;
  readonly loading = this.fieldsStore.loading;

  readonly selectedSport        = signal('toate');
  readonly selectedLocation     = signal('Toate locațiile');
  readonly selectedPrice        = signal<PriceRange>({ label: 'Orice preț', min: 0, max: Infinity });
  readonly selectedAvailability = signal('Toate');

  readonly filteredFields = computed(() => {
    const sport        = this.selectedSport();
    const location     = this.selectedLocation();
    const price        = this.selectedPrice();
    const availability = this.selectedAvailability();

    return this.fields().filter(f => {
      if (sport !== 'toate') {
        const s = this.sports().find(s => s._id === f.sport);
        if (s?.name !== sport) return false;
      }
      if (location !== 'Toate locațiile') {
        const c = this.cities().find(c => c._id === f.city);
        if (c?.name !== location) return false;
      }
      if (f.pricePerHour < price.min || f.pricePerHour > price.max) return false;
      if (availability !== 'Toate' && f.status !== availability.toLowerCase()) return false;
      return true;
    });
  });

  readonly priceRanges: PriceRange[] = [
    { label: 'Orice preț',    min: 0,   max: Infinity },
    { label: 'Sub 50 RON',    min: 0,   max: 50       },
    { label: '50–100 RON',    min: 50,  max: 100      },
    { label: '100–150 RON',   min: 100, max: 150      },
    { label: 'Peste 150 RON', min: 150, max: Infinity },
  ];

  readonly availabilityOptions = ['Toate', 'Disponibil', 'Locuri limitate'];

  constructor() {
    this.sportsStore.loadSports();
    this.citiesStore.loadCities();
    this.fieldsStore.loadFields();
  }

  selectSport(sport: string)     { this.selectedSport.set(sport); }
  selectLocation(loc: string)    { this.selectedLocation.set(loc); }
  selectPrice(range: PriceRange) { this.selectedPrice.set(range); }
  selectAvailability(a: string)  { this.selectedAvailability.set(a); }

  resetFilters() {
    this.selectedSport.set('toate');
    this.selectedLocation.set('Toate locațiile');
    this.selectedPrice.set(this.priceRanges[0]);
    this.selectedAvailability.set('Toate');
  }

  navigateToDetails(fieldId: string) {
    this.router.navigate(['/field-details', fieldId]);
  }
}
