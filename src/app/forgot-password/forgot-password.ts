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
  step: number = 1; // 1: Email verification, 2: New Password
  email: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading = false;
  private verifiedUserId: number | null = null;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  verifyEmail() {
    if (!this.email) {
      this.toastService.showError('Vui lòng nhập tài khoản email');
      return;
    }
    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.getUserByEmail(this.email).subscribe({
      next: (user: any) => {
        this.isLoading = false;
        if (user && user.id) {
          this.verifiedUserId = user.id;
          this.toastService.showSuccess('Đã xác minh email thành công!');
          this.step = 2;
        } else {
          this.toastService.showError('Email không tồn tại trong hệ thống.');
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Email không tồn tại trong hệ thống.');
        this.cdr.detectChanges();
      }
    });
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastService.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (this.newPassword.length < 6) {
      this.toastService.showError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastService.showError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!this.verifiedUserId) {
      this.toastService.showError('Phiên xác minh đã hết hạn. Vui lòng thử lại.');
      this.step = 1;
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();

    this.authService.changeUserPassword(this.verifiedUserId, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.showSuccess('Đổi mật khẩu thành công! Hãy đăng nhập lại.');
        this.router.navigate(['/auth']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        const errorMsg = typeof err.error === 'string' ? err.error : 'Lỗi khi đổi mật khẩu';
        this.toastService.showError(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }
}
