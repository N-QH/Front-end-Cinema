import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-coupons',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-coupons.html',
  styleUrl: '../admin/admin.css'
})
export class AdminCoupons implements OnInit {
  coupons: any[] = [];
  isLoading = true;
  showAddModal = false;
  isSaving = false;

  newCouponData = {
    code: '',
    discountPercent: 10,
    maxUses: 100,
    expiresAt: ''
  };

  constructor(
    private bookingService: BookingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.isLoading = true;
    this.bookingService.getAllCoupons().subscribe({
      next: (res) => {
        this.coupons = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Không thể tải danh sách mã giảm giá');
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal() {
    this.newCouponData = {
      code: '',
      discountPercent: 10,
      maxUses: 100,
      expiresAt: ''
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onSubmit() {
    if (!this.newCouponData.code || this.newCouponData.discountPercent <= 0) {
      this.toastService.showError('Vui lòng điền mã và % giảm giá hợp lệ');
      return;
    }

    this.isSaving = true;
    
    // Convert to target payload format, taking care of empty dates
    const payload = {
      code: this.newCouponData.code,
      discountPercent: this.newCouponData.discountPercent,
      maxUses: this.newCouponData.maxUses,
      expiresAt: this.newCouponData.expiresAt ? new Date(this.newCouponData.expiresAt).toISOString() : null
    };

    this.bookingService.createCoupon(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Đã thêm mã giảm giá thành công');
        this.isSaving = false;
        this.closeAddModal();
        this.loadCoupons();
      },
      error: (err) => {
        this.toastService.showError('Lỗi thêm mã: ' + (err.error || 'Mã có thể đã tồn tại'));
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleActive(coupon: any) {
    this.bookingService.toggleCoupon(coupon.id).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Đã cập nhật trạng thái hoạt động');
        coupon.isActive = !coupon.isActive;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.showError('Lỗi cập nhật trạng thái');
        this.cdr.detectChanges();
      }
    });
  }

  deleteCoupon(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa mã này?')) {
      this.bookingService.deleteCoupon(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Xóa mã giảm giá thành công');
          this.loadCoupons();
        },
        error: (err) => {
          this.toastService.showError('Lỗi xóa mã: ' + (err.error || ''));
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }
}
