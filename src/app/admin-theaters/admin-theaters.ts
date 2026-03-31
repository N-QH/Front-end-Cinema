import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { AdminHeaderComponent } from '../admin-header/admin-header';

@Component({
  selector: 'app-admin-theaters',
  imports: [RouterLink, CommonModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-theaters.html',
  styleUrl: '../admin/admin.css',
})
export class AdminTheaters implements OnInit {
  showAddModal = false;
  isLoading = false;
  isFetching = true;
  
  theaters: any[] = [];
  
  theaterData = {
    name: '',
    address: '',
    city: '',
    state: '',
    country: ''
  };

  seatData = {
    noOfSeatInRow: 10,
    noOfPremiumSeat: 20,
    noOfClassicSeat: 60
  };

  constructor(
    private bookingService: BookingService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTheaters();
  }

  loadTheaters() {
    this.isFetching = true;
    this.bookingService.getTheaters().subscribe({
      next: (res) => {
        this.theaters = res;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  get totalSeats(): number {
    return this.seatData.noOfPremiumSeat + this.seatData.noOfClassicSeat;
  }

  onSubmit() {
    this.isLoading = true;

    this.bookingService.addTheater(this.theaterData).subscribe({
      next: () => {
        // After theater is created, add seats using address as key
        const seatRequest = {
          address: this.theaterData.address,
          noOfSeatInRow: this.seatData.noOfSeatInRow,
          noOfPremiumSeat: this.seatData.noOfPremiumSeat,
          noOfClassicSeat: this.seatData.noOfClassicSeat
        };

        this.bookingService.addTheaterSeat(seatRequest).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.showSuccess('Thêm rạp và cấu hình ghế thành công!');
            this.resetForm();
            this.loadTheaters();
            this.closeAddModal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.isLoading = false;
            this.toastService.showError('Thêm rạp thành công nhưng lỗi cấu hình ghế: ' + (err.error || ''));
            this.loadTheaters();
            this.closeAddModal();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.showError(err.error || 'Lỗi khi thêm rạp');
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.theaterData = { 
      name: '', 
      address: '', 
      city: '', 
      state: '', 
      country: '' 
    };
    this.seatData = { noOfSeatInRow: 10, noOfPremiumSeat: 20, noOfClassicSeat: 60 };
  }

  showDeleteConfirm = false;
  theaterToDeleteId: number | null = null;

  deleteTheater(theaterId: number) {
    this.theaterToDeleteId = theaterId;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.theaterToDeleteId = null;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.theaterToDeleteId) {
      this.bookingService.deleteTheater(this.theaterToDeleteId).subscribe({
        next: () => {
          this.toastService.showSuccess('Xóa rạp chiếu thành công!');
          this.loadTheaters();
          this.cancelDelete();
        },
        error: (err) => {
          this.toastService.showError('Xóa rạp thất bại: ' + (err.error || ''));
          this.cancelDelete();
        }
      });
    }
  }
}
