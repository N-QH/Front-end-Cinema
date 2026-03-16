import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { MovieService } from '../services/movie.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin-shows',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin-shows.html',
  styleUrl: '../admin/admin.css',
})
export class AdminShows implements OnInit {
  showAddModal = false;
  showSeatEditor = false;
  isLoading = false;
  isFetching = true;
  savingSeats = false;
  
  shows: any[] = [];
  movies: any[] = [];
  theaters: any[] = [];

  selectedShow: any = null;
  selectedShowSeats: any[] = [];
  seatRows: string[] = [];

  showData = {
    showDate: '',
    showStartTime: '',
    movieId: null as number | null,
    theaterId: null as number | null
  };

  seatPricing = {
    priceOfPremiumSeat: 120000,
    priceOfClassicSeat: 75000
  };

  constructor(
    private bookingService: BookingService,
    private movieService: MovieService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadShows();
    this.loadLookups();
  }

  loadShows() {
    this.isFetching = true;
    this.bookingService.getShows().subscribe({
      next: (res) => {
        this.shows = res;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLookups() {
    this.movieService.getMovies().subscribe(res => {
      this.movies = res;
      this.cdr.detectChanges();
    });
    this.bookingService.getTheaters().subscribe(res => {
      this.theaters = res;
      this.cdr.detectChanges();
    });
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  openSeatEditor(show: any) {
    this.selectedShow = show;
    this.selectedShowSeats = JSON.parse(JSON.stringify(show.showSeatList || []));
    this.organizeSeats();
    this.showSeatEditor = true;
    this.cdr.detectChanges();
  }

  closeSeatEditor() {
    this.showSeatEditor = false;
    this.selectedShow = null;
    this.selectedShowSeats = [];
  }

  organizeSeats() {
    const rowsSet = new Set<string>();
    this.selectedShowSeats.forEach(s => {
      const rowMatch = s.seatNo.match(/^(\d+)/);
      if (rowMatch) rowsSet.add(rowMatch[1]);
    });
    this.seatRows = Array.from(rowsSet).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getSeatsForRow(row: string) {
    return this.selectedShowSeats.filter(s => {
      const match = s.seatNo.match(/^(\d+)/);
      return match && match[1] === row;
    });
  }

  toggleSeatType(seat: any) {
    if (seat.seatType === 'CLASSIC') {
      seat.seatType = 'PREMIUM';
      seat.price = this.seatPricing.priceOfPremiumSeat;
    } else {
      seat.seatType = 'CLASSIC';
      seat.price = this.seatPricing.priceOfClassicSeat;
    }
    this.cdr.detectChanges();
  }

  saveSeatChanges() {
    if (!this.selectedShow) return;
    this.savingSeats = true;
    const showId = this.selectedShow.showId || this.selectedShow.id;
    this.bookingService.updateShowSeats(showId, this.selectedShowSeats).subscribe({
      next: (updatedSeats) => {
        this.savingSeats = false;
        this.toastService.showSuccess('Cập nhật sơ đồ ghế cho suất chiếu thành công!');
        // Update local data
        this.selectedShow.showSeatList = updatedSeats;
        this.closeSeatEditor();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingSeats = false;
        this.toastService.showError('Lỗi cập nhật sơ đồ ghế: ' + (err.error || ''));
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  }

  onSubmit() {
    this.isLoading = true;

    // Ensure time format is HH:mm:ss for java.sql.Time
    let timeValue = this.showData.showStartTime;
    if (timeValue && timeValue.length === 5) {
      timeValue = timeValue + ':00';
    }

    const showRequest = {
      showDate: this.showData.showDate,
      showStartTime: timeValue,
      movieId: this.showData.movieId,
      theaterId: this.showData.theaterId
    };

    this.bookingService.addShow(showRequest).subscribe({
      next: (res) => {
        // After show is added, we need to associate seats
        // Let's find the show by fetching all shows again
        this.bookingService.getShows().subscribe({
          next: (allShows) => {
            // Find the show matching our criteria (usually the last one)
            const latestShow = allShows[allShows.length - 1];
            if (latestShow) {
              const seatRequest = {
                showId: latestShow.showId || latestShow.id,
                priceOfPremiumSeat: this.seatPricing.priceOfPremiumSeat,
                priceOfClassicSeat: this.seatPricing.priceOfClassicSeat
              };

              this.bookingService.associateShowSeats(seatRequest).subscribe({
                next: () => {
                  this.isLoading = false;
                  this.toastService.showSuccess('Thêm lịch chiếu và cấu hình ghế thành công!');
                  this.resetForm();
                  this.closeAddModal();
                  this.loadShows();
                  this.cdr.detectChanges();
                }
              });
            }
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.showError(err.error || 'Lỗi khi thêm lịch chiếu');
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.showData = {
      showDate: '',
      showStartTime: '',
      movieId: null,
      theaterId: null
    };
  }

  deleteShow(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
      this.bookingService.deleteShow(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Đã xóa lịch chiếu thành công!');
          this.loadShows();
        },
        error: () => {
          this.toastService.showError('Không thể xóa suất chiếu này.');
        }
      });
    }
  }
}
