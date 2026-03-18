import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  isLoginMode = true;
  isLoading = false;
  
  error: string | null = null;
  successMessage: string | null = null;

  loginData = { username: '', password: '' };
  registerData = { 
    name: '', 
    email: '', 
    password: '', 
    mobileNo: '', 
    age: 18, 
    gender: 'MALE', 
    address: '', 
    roles: 'CUSTOMER' 
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.successMessage = null;
  }

  clearError() {
    this.error = null;
  }

  onSubmit() {
    setTimeout(() => {
      this.isLoading = true;
      this.error = null;
      this.successMessage = null;
    });

    if (this.isLoginMode) {
      this.authService.login(this.loginData).subscribe({
        next: () => {
          this.router.navigate(['/']);
          setTimeout(() => {
            this.isLoading = false;
          });
        },
        error: (err) => {
          setTimeout(() => {
            if (err.error && typeof err.error === 'string' && err.error.includes("Tài khoản của bạn đã bị khóa")) {
              this.error = "Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin";
            } else {
              this.error = 'Email hoặc mật khẩu không chính xác';
            }
            this.isLoading = false;
          });
        }
      });
    } else {
      this.authService.register(this.registerData).subscribe({
        next: () => {
          this.toastService.showSuccess('Đăng ký thành công!');
          this.router.navigate(['/']);
          setTimeout(() => {
            this.isLoading = false;
          });
        },
        error: (err) => {
          const errMsg = err.error || 'Đăng ký thất bại, vui lòng thử lại.';
          this.toastService.showError(errMsg);
          setTimeout(() => {
            this.error = errMsg;
            this.isLoading = false;
          });
        }
      });
    }
  }
}
