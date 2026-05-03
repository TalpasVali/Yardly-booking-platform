import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ImageUrlPipe } from '../../core/pipe/image.pipe';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageUrlPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() field: any;
  @Output() viewDetails = new EventEmitter<string>();

  goToDetails(fieldId?: string) {
    this.viewDetails.emit(fieldId);
  }
}
