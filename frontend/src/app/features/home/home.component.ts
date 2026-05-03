import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HomeFacade } from './facades/home.facade';
import { SkeletonComponent } from '../../shared-ui/skeleton/skeleton.component';
import { ImageUrlPipe } from '../../core/pipe/image.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterModule, SkeletonComponent, ImageUrlPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly facade = inject(HomeFacade);

  readonly locations = ['Bucuresti', 'Cluj-Napoca', 'Timișoara', 'Brașov', 'Iași'];
  readonly dates     = ['Today', 'Tomorrow', 'Select Date'];
  readonly sports    = ['Soccer', 'Tennis', 'Basketball', 'Padel'];

  // [(ngModel)] funcționează cu signal prin getter/setter
  readonly selectedLocation = signal(this.locations[0]);
  readonly selectedDate     = signal(this.dates[0]);
  readonly selectedSport    = signal(this.sports[0]);

  constructor() {
    this.facade.init();
  }

  getSportName(sportId: string): string {
    const sport = this.facade.vm.popularSports().find(s => s._id === sportId);
    return sport?.name ?? '';
  }

  onSearch() {
    console.log('Search:', this.selectedLocation(), this.selectedDate(), this.selectedSport());
  }

  onBook(fieldId: string) {
    console.log('Book field:', fieldId);
  }
}
