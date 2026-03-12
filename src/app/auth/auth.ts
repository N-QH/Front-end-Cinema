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
    emailId: '', 
    password: '', 
    mobileNo: '', 
    age: 18, 
    gender: 'MALE', 
    address: '', 
    roles: 'USER' 
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
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    if (this.isLoginMode) {
      this.authService.login(this.loginData).subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Email hoặc mật khẩu không chính xác';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.authService.register(this.registerData).subscribe({
        next: () => {
          this.toastService.showSuccess('Đăng ký thành công!');
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: (err) => {
          const errMsg = err.error || 'Đăng ký thất bại, vui lòng thử lại.';
          this.toastService.showError(errMsg);
          this.error = errMsg;
          this.isLoading = false;
        }
      });
    }
  }
}
