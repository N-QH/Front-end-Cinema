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
    dateOfBirth: '', 
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
      // Handle switch to register mode
      if (params['mode'] === 'register') {
        this.isLoginMode = false;
      }

      const token = params['token'];
      if (token) {
        localStorage.setItem('token', token);
        // We might need to notify AuthService about the new token
        // But AuthService.getToken() already reads from localStorage
        // Triggering a navigation to clear the URL params
        const returnUrl = params['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl, { replaceUrl: true }).then(() => {
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
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
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
          
          // Explicitly call login after registration to ensure token is set and state is updated
          this.authService.login({
            email: this.registerData.email,
            password: this.registerData.password
          }).subscribe({
            next: () => {
              const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigateByUrl(returnUrl).then(() => {
                window.location.reload(); // Force reload to ensure Header and other components sync state
              });
              this.isLoading = false;
            },
            error: () => {
              // Fallback if auto-login fails
              this.router.navigate(['/auth']);
              this.isLoading = false;
            }
          });
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
