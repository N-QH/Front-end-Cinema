import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  toastState$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    setTimeout(() => this.toastSubject.next({ message, type: 'success' }));
  }

  showError(message: string) {
    setTimeout(() => this.toastSubject.next({ message, type: 'error' }));
  }

  showInfo(message: string) {
    setTimeout(() => this.toastSubject.next({ message, type: 'info' }));
  }
}
