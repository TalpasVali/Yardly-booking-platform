import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'yardly-toast',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./yardly-toast.component.scss'],
  templateUrl: './yardly-toast.component.html',
})
export class YardlyToastComponent {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'warning' = 'success';
  @Output() close = new EventEmitter<void>();

  get icon(): string {
    switch (this.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      default:
        return '';
    }
  }

  get borderClass(): string {
    switch (this.type) {
      case 'success':
        return 'border-success text-success';
      case 'error':
        return 'border-error text-error';
      case 'warning':
        return 'border-warning text-warning';
      default:
        return '';
    }
  }
}
