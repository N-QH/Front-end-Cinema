import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  isLoading = true;
  isSaving = false;
  isUploadingAvatar = false;
  
  userId = -1;

  userProfile: any = null;
  newPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    const email = this.authService.getUserEmail();
    
    if (!email) {
      this.toastService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      this.router.navigate(['/auth']);
      return;
    }

    this.authService.getUserByEmail(email).subscribe({
      next: (res) => {
        this.userProfile = res;
        this.userId = res.id;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.showError('Không thể tải thông tin hồ sơ.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    this.isSaving = true;

    const reqOptions: any = {
      name: this.userProfile.name,
      email: this.userProfile.email,
      mobileNo: this.userProfile.mobileNo,
      dateOfBirth: this.userProfile.dateOfBirth,
      gender: this.userProfile.gender,
      address: this.userProfile.address,
      roles: Array.isArray(this.userProfile.roles) ? this.userProfile.roles.join(',') : (this.userProfile.roles || 'CUSTOMER'),
      userImage: this.userProfile.userImage
    };

    if (this.newPassword && this.newPassword.trim() !== '') {
      reqOptions.password = this.newPassword;
    }

    this.authService.updateProfile(this.userId, reqOptions).subscribe({
      next: (res) => {
        // Even if res is not a perfect string, we consider it success here.
        this.toastService.showSuccess('Cập nhật thông tin thành công!');
        this.isSaving = false;
        this.newPassword = ''; // Reset password field
        
        // Update local object to reflect new values
        this.userProfile.name = reqOptions.name;
        this.userProfile.mobileNo = reqOptions.mobileNo;
        this.userProfile.userImage = reqOptions.userImage;
        
        // Refresh global state so Header updates instantly
        this.authService.refreshUserFavorites();
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Check if error is actually a success response parsed as error by Angular (status 200 but not JSON)
        if (err.status === 200) {
          this.toastService.showSuccess('Cập nhật thông tin thành công!');
          this.isSaving = false;
          this.newPassword = ''; // Reset password field
          this.userProfile.userImage = reqOptions.userImage;
          this.authService.refreshUserFavorites();
          this.cdr.detectChanges();
          return;
        }

        const errMsg = typeof err.error === 'string' ? err.error : (err.message || 'Cập nhật thông tin thất bại.');
        this.toastService.showError(errMsg);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  onProfileImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.isUploadingAvatar = true;
      const formData = new FormData();
      formData.append('file', file);
      this.http.post<string>(`${environment.apiUrl}/upload/image`, formData, { responseType: 'text' as 'json' })
        .subscribe({
          next: (url) => {
            this.userProfile.userImage = url;
            this.isUploadingAvatar = false;
            this.toastService.showSuccess('Cập nhật avatar thành công! Lưu lại để hoàn tất.');
            this.cdr.detectChanges();
          },
          error: () => {
            this.isUploadingAvatar = false;
            this.toastService.showError('Tải ảnh lên thất bại!');
            this.cdr.detectChanges();
          }
        });
    }
  }
}
