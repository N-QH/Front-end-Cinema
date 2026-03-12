import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toasts; track toast) {
        <div class="toast" [ngClass]="toast.type">
          @if (toast.type === 'success') {
            <i class="fa-solid fa-circle-check"></i>
          } @else if (toast.type === 'error') {
            <i class="fa-solid fa-circle-exclamation"></i>
          } @else {
            <i class="fa-solid fa-circle-info"></i>
          }
          <span>{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 250px;
      padding: 16px 20px;
      border-radius: 8px;
      font-weight: 500;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      animation: slideIn 0.3s ease-out forwards;
      opacity: 0;
    }

    .toast.success {
      background-color: #10b981;
    }

    .toast.error {
      background-color: #ef4444;
    }

    .toast.info {
      background-color: #3b82f6;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription!: Subscription;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.toastService.toastState$.subscribe(toast => {
      this.toasts.push(toast);
      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.toasts.shift();
        this.cdr.detectChanges();
      }, 5000);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
