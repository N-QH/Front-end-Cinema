import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <button class="back-link" routerLink="/">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <h2>Cài đặt hệ thống</h2>
      </div>

      <div class="settings-sections">
        <!-- Dark Mode Section -->
        <div class="settings-card">
          <div class="card-header">
            <i class="fa-solid fa-moon"></i>
            <h3>Giao diện</h3>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-title">Chế độ tối (Dark Mode)</span>
            </div>
            <div class="toggle-switch" [class.active]="isDarkMode" (click)="toggleDarkMode()">
              <div class="toggle-handle"></div>
            </div>
          </div>
        </div>

        <!-- Payment Section -->
        <div class="settings-card">
          <div class="card-header">
            <i class="fa-solid fa-credit-card"></i>
            <h3>Thêm thẻ</h3>
          </div>

          <div class="payment-info" *ngIf="user?.paymentToken">
            <div class="card-box">
              <i class="fa-brands fa-cc-visa"></i>
              <span>**** **** **** 8888</span>
              <button class="remove-btn" (click)="removeCard()">Gỡ thẻ</button>
            </div>
          </div>

          <div class="add-card-section" *ngIf="!user?.paymentToken">
            <p class="setting-desc">
              Bạn chưa liên kết phương thức thanh toán. Hãy thêm thẻ để sử dụng tính năng Đặt vé
              nhanh.
            </p>
            <div class="mock-card-input">
              <input
                type="text"
                placeholder="Số thẻ (Mock)"
                [(ngModel)]="mockCardNo"
                maxlength="16"
              />
              <button class="add-btn" (click)="addCard()" [disabled]="!mockCardNo">Thêm thẻ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-container {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
      }
      .settings-header {
        margin-bottom: 32px;
      }
      .back-link {
        font-size: 14px;
        color: var(--text-muted);
        margin-bottom: 12px;
        display: inline-block;
        cursor: pointer;
      }
      .settings-header h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--text-main);
      }
      .settings-sections {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .settings-card {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      }
      .card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
        color: var(--primary-color);
      }
      .card-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-main);
        margin: 0;
      }
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .setting-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .setting-title {
        font-weight: 600;
        color: var(--text-main);
      }
      .setting-desc {
        font-size: 13px;
        color: var(--text-muted);
      }
      .toggle-switch {
        width: 48px;
        height: 26px;
        background: #e5e7eb;
        border-radius: 99px;
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
      }
      .toggle-switch.active {
        background: var(--primary-color);
      }
      .toggle-handle {
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        left: 3px;
        transition: transform 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .toggle-switch.active .toggle-handle {
        transform: translateX(22px);
      }
      .payment-info .card-box {
        background: var(--primary-light);
        padding: 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        color: var(--text-main);
        font-weight: 500;
      }
      .payment-info .fa-cc-visa {
        font-size: 32px;
        color: #0061b2;
      }
      .remove-btn {
        margin-left: auto;
        color: #ef4444;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .mock-card-input {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      .mock-card-input input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        background: var(--bg-color);
        color: var(--text-main);
        outline: none;
      }
      .add-btn {
        background: var(--primary-color);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .add-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class Settings implements OnInit {
  isDarkMode = false;
  user: any = null;
  mockCardNo = '';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyTheme();

    const user: any = this.authService.currentUserValue;
    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe((fullUser) => {
        this.user = fullUser;
        this.cdr.detectChanges();
      });
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    this.cdr.detectChanges();
  }

  applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  addCard() {
    if (!this.user?.id) return;
    const token = 'mock_token_' + this.mockCardNo;
    this.authService.addPaymentMethod(this.user.id, token).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess('Đã thêm thẻ thành công!');
        this.user.paymentToken = token;
        this.mockCardNo = '';
        this.cdr.detectChanges();
      },
      error: () => this.toastService.showError('Không thể thêm thẻ'),
    });
  }

  removeCard() {
    if (!this.user?.id) return;
    this.authService.addPaymentMethod(this.user.id, null).subscribe({
      next: (res: string) => {
        this.user.paymentToken = null;
        this.user.isOneTapEnabled = false; // Sync with backend behavior
        this.toastService.showSuccess(res || 'Đã gỡ thẻ');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.showError(err.error || 'Không thể gỡ thẻ');
      }
    });
  }
}
