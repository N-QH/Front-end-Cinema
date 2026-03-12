import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-admin-theaters',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin-theaters.html',
  styleUrl: '../admin/admin.css',
})
export class AdminTheaters implements OnInit {
  showAddModal = false;
  isLoading = false;
  isFetching = true;
  message: string | null = null;
  error: string | null = null;
  
  theaters: any[] = [];

  theaterData = {
    name: '',
    address: ''
  };

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadTheaters();
  }

  loadTheaters() {
    this.isFetching = true;
    this.bookingService.getTheaters().subscribe({
      next: (res) => {
        this.theaters = res;
        this.isFetching = false;
      },
      error: () => this.isFetching = false
    });
  }

  openAddModal() {
    this.showAddModal = true;
    this.message = null;
    this.error = null;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onSubmit() {
    this.isLoading = true;
    this.message = null;
    this.error = null;

    this.bookingService.addTheater(this.theaterData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = 'Thêm rạp thành công!';
        this.loadTheaters();
        setTimeout(() => this.closeAddModal(), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error || 'Lỗi khi thêm rạp';
      }
    });
  }

  deleteTheater(id: number) {
    if(confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
      this.bookingService.deleteTheater(id).subscribe({
        next: () => {
          this.loadTheaters();
        },
        error: (err) => {
          alert('Không thể xóa rạp này.');
        }
      });
    }
  }
}
