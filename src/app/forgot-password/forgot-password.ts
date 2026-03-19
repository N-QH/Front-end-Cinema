import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  step: number = 1; // 1: Email, 2: Token + New Password
  email: string = '';
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  requestOtp() {
    if (!this.email) {
      this.toastService.showError('Vui lòng nhập tài khoản email');
      return;
    }
    this.isLoading = true;
    this.cdr.detectChanges();
    this.authService.requestPasswordReset(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastService.showSuccess(res || 'Mã OTP đã được gửi đến email của bạn');
        this.step = 2;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Có lỗi xảy ra, vui lòng kiểm tra lại email.');
        this.toastService.showError(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword() {
    if (!this.token || !this.newPassword || !this.confirmPassword) {
      this.toastService.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.showError('Mật khẩu xác nhận không khớp');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.toastService.showSuccess('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
        this.router.navigate(['/auth']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        const errorMsg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Lỗi khi xác minh mã OTP');
        this.toastService.showError(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }
}
