import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../yardly-toast.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { YardlyToastComponent } from '../yardly-toast/yardly-toast.component';

interface ToastInternal extends ToastMessage {
  state: 'enter' | 'leave';
}

@Component({
  selector: 'yardly-toast-container',
  standalone: true,
  imports: [CommonModule, YardlyToastComponent],
  templateUrl: './yardly-toast-container.component.html',
})
export class YardlyToastContainerComponent implements OnInit, OnDestroy {
  notifications: ToastInternal[] = [];
  sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toastState$.subscribe((toast) => {
      const toastItem: ToastInternal = { ...toast, state: 'enter' };
      this.notifications.push(toastItem);

      setTimeout(() => this.startLeaveAnimation(toastItem), 3000);
    });
  }

  startLeaveAnimation(toast: ToastInternal) {
    toast.state = 'leave';
    setTimeout(() => this.remove(toast), 900);
  }

  remove(toast: ToastInternal) {
    this.notifications = this.notifications.filter((n) => n !== toast);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
