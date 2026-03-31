import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { MovieService } from '../services/movie.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { AdminHeaderComponent } from '../admin-header/admin-header';

@Component({
  selector: 'app-admin-coupons',
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-coupons.html',
  styleUrl: '../admin/admin.css'
})
export class AdminCoupons implements OnInit {
  coupons: any[] = [];
  allMovies: any[] = [];
  isLoading = true;
  showAddModal = false;
  isSaving = false;
  isEditMode = false;
  editingCouponId: number | null = null;

  newCouponData = {
    code: '',
    discountPercent: 10,
    maxUses: 100,
    expiresAt: ''
  };
  selectedMovieIds: number[] = [];

  constructor(
    private bookingService: BookingService,
    private movieService: MovieService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCoupons();
    this.movieService.getMovies().subscribe({
      next: (movies) => { this.allMovies = movies; },
      error: () => {}
    });
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
    this.isEditMode = false;
    this.editingCouponId = null;
    this.newCouponData = {
      code: '',
      discountPercent: 10,
      maxUses: 100,
      expiresAt: ''
    };
    this.selectedMovieIds = [];
    this.showAddModal = true;
  }

  openEditModal(coupon: any) {
    this.isEditMode = true;
    this.editingCouponId = coupon.id;
    this.newCouponData = {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : ''
    };
    this.selectedMovieIds = coupon.applicableMovies ? coupon.applicableMovies.map((m: any) => m.id) : [];
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  toggleMovieSelection(movieId: number) {
    const idx = this.selectedMovieIds.indexOf(movieId);
    if (idx > -1) {
      this.selectedMovieIds.splice(idx, 1);
    } else {
      this.selectedMovieIds.push(movieId);
    }
  }

  onSubmit() {
    if (!this.newCouponData.code || this.newCouponData.discountPercent <= 0) {
      this.toastService.showError('Vui lòng điền mã và % giảm giá hợp lệ');
      return;
    }

    this.isSaving = true;
    
    // Convert to target payload format, taking care of empty dates
    const payload: any = {
      code: this.newCouponData.code,
      discountPercent: this.newCouponData.discountPercent,
      maxUses: this.newCouponData.maxUses,
      expiresAt: this.newCouponData.expiresAt ? new Date(this.newCouponData.expiresAt).toISOString() : null,
      movieIds: this.selectedMovieIds.length > 0 ? this.selectedMovieIds : null
    };

    if (this.isEditMode && this.editingCouponId) {
      this.bookingService.updateCoupon(this.editingCouponId, payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Đã cập nhật mã giảm giá thành công');
          this.isSaving = false;
          this.closeAddModal();
          this.loadCoupons();
        },
        error: (err) => {
          this.toastService.showError('Lỗi cập nhật mã: ' + (err.error || ''));
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
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

  getMovieNames(coupon: any): string {
    if (!coupon.applicableMovies || coupon.applicableMovies.length === 0) return 'Tất cả phim';
    return coupon.applicableMovies.map((m: any) => m.movieName).join(', ');
  }
}
