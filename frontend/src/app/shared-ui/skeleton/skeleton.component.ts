import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() type: 'field-card' | 'stat' | 'table-row' | 'slots' | 'field-detail' = 'field-card';
  @Input() count = 3;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
