import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  resetFilters(): void {
    console.log('Reset filters');
  }

  exploreFields(): void {
    console.log('Explore fields');
  }

  contactSupport(): void {
    console.log('Contact support');
  }
}
