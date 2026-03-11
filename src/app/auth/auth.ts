import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
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

  loginData = { username: '', password: '' };
  registerData = { 
    name: '', 
    emailId: '', 
    password: '', 
    mobileNo: '', 
    age: 18, 
    gender: 'MALE', 
    address: '', 
    roles: 'ROLE_USER' 
  };

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
  }

  onSubmit() {
    this.isLoading = true;
    this.error = null;

    if (this.isLoginMode) {
      this.authService.login(this.loginData).subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Invalid email or password';
          this.isLoading = false;
        }
      });
    } else {
      this.authService.register(this.registerData).subscribe({
        next: () => {
          this.toggleMode();
          this.loginData.username = this.registerData.emailId;
          this.loginData.password = this.registerData.password;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error || 'Registration failed';
          this.isLoading = false;
        }
      });
    }
  }
}
