import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
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
export class Payment implements OnInit, OnDestroy {
  bookingInfo: any;
  isProcessing = false;
  timeLeft: number = 300;
  timerString: string = '05:00';
  intervalId: any;
  holdExpired: boolean = false;
  bookingSuccess: boolean = false;

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

  ngOnInit() {
    if (this.bookingInfo) {
      const holdEndStr = sessionStorage.getItem('seatHoldEndTime');
      if (holdEndStr) {
        const holdEnd = parseInt(holdEndStr, 10);
        this.startTimer(holdEnd);
      } else {
        this.cancelPayment('Phiên giao dịch không hợp lệ');
      }
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Release seats if user navigates away before success or expiration
    if (!this.bookingSuccess && !this.holdExpired && this.bookingInfo) {
       const payload = {
          showId: this.bookingInfo.showId,
          userId: this.bookingInfo.userId,
          requestSeats: this.bookingInfo.seats
       };
       this.bookingService.releaseSeats(payload).subscribe();
    }
  }

  startTimer(holdEnd: number) {
    this.intervalId = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((holdEnd - now) / 1000);
      
      if (diff <= 0) {
        clearInterval(this.intervalId);
        this.timerString = '00:00';
        this.handleExpiration();
      } else {
        this.timeLeft = diff;
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        this.timerString = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  handleExpiration() {
    this.holdExpired = true;
    this.isProcessing = true;
    
    const payload = {
        showId: this.bookingInfo.showId,
        userId: this.bookingInfo.userId,
        requestSeats: this.bookingInfo.seats
    };
    this.bookingService.releaseSeats(payload).subscribe();

    this.toastService.showError('Hết thời gian giữ ghế! Vui lòng chọn lại.');
    this.router.navigate(['/booking', this.bookingInfo.movie?.id || '']);
  }

  cancelPayment(reason?: string) {
    if (this.bookingInfo) {
      const payload = {
          showId: this.bookingInfo.showId,
          userId: this.bookingInfo.userId,
          requestSeats: this.bookingInfo.seats
      };
      this.bookingService.releaseSeats(payload).subscribe(() => {
        if (reason) {
            this.toastService.showError(reason);
        }
        this.router.navigate(['/booking', this.bookingInfo.movie?.id || '']);
      });
    } else {
       if (reason) this.toastService.showError(reason);
       this.router.navigate(['/']);
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
        this.bookingSuccess = true;
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
