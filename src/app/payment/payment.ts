import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-payment',
  imports: [RouterLink, CommonModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment {
  bookingInfo: any;
  isProcessing = false;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.bookingInfo = navigation?.extras.state?.['bookingInfo'];
    
    if (!this.bookingInfo) {
      console.warn('No booking info found in state.');
    }
  }

  formatPrice(price: number): string {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  getSeatsString(): string {
    return this.bookingInfo?.seats?.join(', ') || 'N/A';
  }

  confirmPayment() {
    if (!this.bookingInfo || this.isProcessing) return;
    this.isProcessing = true;
    this.cdr.detectChanges(); // Fix NG0100

    const payload = {
      showId: this.bookingInfo.showId,
      userId: this.bookingInfo.userId,
      requestSeats: this.bookingInfo.seats
    };

    this.bookingService.bookTicket(payload).subscribe({
      next: (res) => {
        this.toastService.showSuccess('Thanh toán thành công! Vé đã được đặt.');
        this.router.navigate(['/tickets']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.cdr.detectChanges(); // Update UI after error
        this.toastService.showError('Thanh toán thất bại: ' + (err.error || 'Lỗi máy chủ'));
      }
    });
  }
}
