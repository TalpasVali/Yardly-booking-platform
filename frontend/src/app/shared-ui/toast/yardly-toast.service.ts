import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toastState$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.toastSubject.next({ message, type });
  }
}
