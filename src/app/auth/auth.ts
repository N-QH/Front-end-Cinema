import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth implements OnInit {
  isLoginMode = true;
  isLoading = false;
  
  error: string | null = null;
  successMessage: string | null = null;

  loginData = { email: '', password: '' };
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
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('token', token);
        // We might need to notify AuthService about the new token
        // But AuthService.getToken() already reads from localStorage
        // Triggering a navigation to clear the URL params
        this.router.navigate(['/'], { replaceUrl: true }).then(() => {
          window.location.reload(); // Force reload to update state across app
        });
      }
    });
  }

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
        },
        error: (err) => {
          if (err.error && typeof err.error === 'string' && err.error.includes("Tài khoản của bạn đã bị khóa")) {
            this.error = "Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin";
          } else {
            this.error = 'Email hoặc mật khẩu không chính xác';
          }
          this.isLoading = false;
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
