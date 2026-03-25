import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-customers',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-customers.html',
  styleUrl: '../admin/admin.css'
})
export class AdminCustomers implements OnInit {
  users: any[] = [];
  isLoading = true;
  
  showAddModal = false;
  isSaving = false;
  
  showPasswordModal = false;
  selectedUserId: number | null = null;
  newPassword = '';
  isSavingPassword = false;
  
  newUserData = {
    name: '',
    email: '',
    password: '',
    age: null,
    gender: 'MALE',
    address: '',
    mobileNo: '',
    roles: 'CUSTOMER'
  };

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Không thể tải danh sách khách hàng');
        this.cdr.detectChanges();
      }
    });
  }

  toggleLock(user: any) {
    this.authService.toggleLock(user.id).subscribe({
      next: (res) => {
        this.toastService.showSuccess(res);
        user.isActive = !user.isActive;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.showError('Lỗi cập nhật trạng thái');
        this.cdr.detectChanges();
      }
    });
  }

  showDeleteConfirm = false;
  userToDelete: any = null;

  deleteUser(user: any) {
    this.userToDelete = user;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.userToDelete) {
      this.authService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Xóa người dùng thành công!');
          this.loadUsers();
          this.cancelDelete();
        },
        error: (err) => {
          this.toastService.showError('Lỗi xóa khách hàng: ' + (err?.error || err.message));
          this.cancelDelete();
        }
      });
    }
  }

  openAddModal() {
    this.newUserData = {
      name: '', email: '', password: '', age: null, gender: 'MALE', address: '', mobileNo: '', roles: 'CUSTOMER'
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onSubmit() {
    this.isSaving = true;
    this.authService.register(this.newUserData).subscribe({
      next: () => {
        this.toastService.showSuccess('Đã thêm tài khoản mới thành công');
        this.isSaving = false;
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.showError('Lỗi thêm tài khoản: ' + err.error);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  openPasswordModal(user: any) {
    this.selectedUserId = user.id;
    this.newPassword = '';
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
    this.selectedUserId = null;
    this.newPassword = '';
  }

  submitPasswordChange() {
    if (!this.selectedUserId || !this.newPassword) return;
    if (this.newPassword.length < 6) {
      this.toastService.showError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    this.isSavingPassword = true;
    this.authService.changeUserPassword(this.selectedUserId, this.newPassword).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Đã đổi mật khẩu thành công');
        this.isSavingPassword = false;
        this.closePasswordModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.showError('Lỗi đổi mật khẩu: ' + (err.error || ''));
        this.isSavingPassword = false;
        this.cdr.detectChanges();
      }
    });
  }
}
