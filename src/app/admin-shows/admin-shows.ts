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
    screenNumber: null as number | null,
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
    // Map existing showSeatList or empty array
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
      const seatNo = s.theaterSeat?.seatNo || s.seatNo;
      if (!seatNo) return;
      const rowMatch = seatNo.match(/^(\d+)/);
      if (rowMatch) rowsSet.add(rowMatch[1]);
      else {
          const alphaMatch = seatNo.match(/^([A-Z]+)/);
          if (alphaMatch) rowsSet.add(alphaMatch[1]);
      }
    });
    this.seatRows = Array.from(rowsSet).sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        return a.localeCompare(b);
    });
  }

  getSeatsForRow(row: string) {
    return this.selectedShowSeats.filter(s => {
      const seatNo = s.theaterSeat?.seatNo || s.seatNo;
      if (!seatNo) return false;
      const rowMatch = seatNo.match(/^(\d+)/);
      if (rowMatch) return rowMatch[1] === row;
      const alphaMatch = seatNo.match(/^([A-Z]+)/);
      return alphaMatch && alphaMatch[1] === row;
    });
  }

  toggleSeatType(seat: any) {
    const currentType = seat.theaterSeat?.seatType || seat.seatType;
    if (currentType === 'STANDARD') {
      if (seat.theaterSeat) seat.theaterSeat.seatType = 'PREMIUM';
      seat.seatType = 'PREMIUM';
      seat.price = this.seatPricing.priceOfPremiumSeat;
    } else {
      if (seat.theaterSeat) seat.theaterSeat.seatType = 'STANDARD';
      seat.seatType = 'STANDARD';
      seat.price = this.seatPricing.priceOfClassicSeat;
    }
    this.cdr.detectChanges();
  }

  saveSeatChanges() {
    if (!this.selectedShow) return;
    this.savingSeats = true;
    const showId = this.selectedShow.showId || this.selectedShow.id;
    
    // We'll use associateShowSeats to re-sync or a specific update call if available.
    // Given previous context, updateShowSeats was being used.
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
      screenNumber: this.showData.screenNumber,
      movieId: this.showData.movieId,
      theaterId: this.showData.theaterId
    };

    this.bookingService.addShow(showRequest).subscribe({
      next: (showIdStr) => {
        const showId = parseInt(showIdStr, 10);
        if (isNaN(showId)) {
           this.toastService.showError('Thêm lịch chiếu thành công nhưng Backend trả về ID hỏng.');
           this.isLoading = false;
           this.loadShows();
           this.cdr.detectChanges();
           return;
        }

        const seatRequest = {
          showId: showId,
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
          },
          error: (err) => {
             this.isLoading = false;
             this.toastService.showError('Lỗi cấu hình ghế: ' + (err.error || ''));
             this.loadShows();
             this.cdr.detectChanges();
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
      screenNumber: null,
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
