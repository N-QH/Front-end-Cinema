import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../services/toast.service';

interface SeatInfo {
  id: number;
  seatNo: string;
  type: string;
  price: number;
  occupied: boolean;
}

@Component({
  selector: 'app-booking',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  movieId: number | null = null;
  theaters: any[] = [];
  shows: any[] = [];
  
  availableDates: string[] = [];
  selectedDate: string | null = null;
  showsForSelectedDate: any[] = [];
  
  selectedTheaterId: number | null = null;
  selectedShowId: number | null = null;
  
  seats: SeatInfo[] = [];
  seatRows: string[] = [];
  selectedSeats: string[] = []; // Store seatNo for display
  selectedSeatNos: string[] = []; // Redundant but keeping consistent
  totalPrice = 0;
  userId: number | null = null;
  isOneTapEnabled = false;
  isBooking = false;
  showAuthModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = +id;
      this.loadBookingData();
    }
    this.fetchCurrentUser();
  }

  fetchCurrentUser() {
    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe(user => {
        if (user && user.id) {
          this.userId = user.id;
          this.isOneTapEnabled = !!user.isOneTapEnabled;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadBookingData() {
    this.bookingService.getTheaters().subscribe(res => {
      this.theaters = res;
      if (this.theaters.length > 0) this.onTheaterChange(this.theaters[0].id);
      this.cdr.detectChanges();
    });

    if (this.movieId) {
      this.bookingService.getShowsByMovieId(this.movieId).subscribe(res => {
        this.shows = res;
        this.updateAvailableDates();
        this.cdr.detectChanges();
      });
    }
  }

  onTheaterChange(theaterId: number) {
    this.selectedTheaterId = theaterId;
    this.updateAvailableDates();
  }

  updateAvailableDates() {
    if (!this.selectedTheaterId || this.shows.length === 0) {
      this.availableDates = [];
      this.selectedDate = null;
      this.showsForSelectedDate = [];
      return;
    }

    const theaterShows = this.shows.filter(s => (s.theater?.id === this.selectedTheaterId));
    // Fallback if shows don't have theater populated in frontend DTO, but they typically should.
    const relevantShows = theaterShows.length > 0 ? theaterShows : this.shows;

    const tempDates = new Set<string>();
    relevantShows.forEach(s => tempDates.add(s.showDate));
    
    this.availableDates = Array.from(tempDates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (this.availableDates.length > 0) {
      this.selectDate(this.availableDates[0], relevantShows);
    } else {
      this.selectedDate = null;
      this.showsForSelectedDate = [];
      this.selectedShowId = null;
    }
    this.cdr.detectChanges();
  }

  selectDate(d: string, relevantShows: any[] = this.shows) {
    this.selectedDate = d;
    this.showsForSelectedDate = relevantShows.filter(s => s.showDate === d);
    
    // Sort shows by time so they appear chronologically
    this.showsForSelectedDate.sort((a, b) => {
      const timeA = a.showTime || '';
      const timeB = b.showTime || '';
      return timeA.localeCompare(timeB);
    });

    this.selectedShowId = null; 
    this.seats = [];
    this.selectedSeats = [];
    this.totalPrice = 0;
    this.cdr.detectChanges();
  }

  isPastShow(s: any): boolean {
    if (!s.showDate || !s.showTime) return true;
    const now = new Date();
    // Use the correct property: showTime
    const showDateTime = new Date(`${s.showDate}T${s.showTime}`);
    return showDateTime <= now;
  }

  selectShow(show: any) {
    this.selectedShowId = show.showId || show.id;
    this.selectedSeats = [];
    this.totalPrice = 0;
    
    // Load seats for this show
    if (show.showSeatList) {
      this.seats = show.showSeatList.map((s: any) => {
        let isOccupied = !s.isAvailable;
        
        // Handle temporary seat held mechanism
        if (s.isAvailable && s.heldUntil) {
          const holdTime = new Date(s.heldUntil).getTime();
          const now = new Date().getTime();
          // If the seat is held by someone else and the hold hasn't expired
          if (now < holdTime && s.heldByUserId !== this.userId) {
            isOccupied = true;
          }
        }

        return {
          id: s.id,
          seatNo: s.theaterSeat?.seatNo || s.seatNo,
          type: s.seatType || s.theaterSeat?.seatType,
          price: s.price,
          occupied: isOccupied
        };
      });
      
      // Organize into rows by numeric prefix (seatNo format: "1A", "2B", etc.)
      const rowsSet = new Set<string>();
      this.seats.forEach(s => {
        const rowMatch = s.seatNo.match(/^(\d+)/);
        if (rowMatch) rowsSet.add(rowMatch[1]);
      });
      this.seatRows = Array.from(rowsSet).sort((a, b) => parseInt(a) - parseInt(b));
    }
    this.cdr.detectChanges();
  }

  getSeatsForRow(row: string): SeatInfo[] {
    return this.seats.filter(s => {
      const match = s.seatNo.match(/^(\d+)/);
      return match && match[1] === row;
    });
  }

  toggleSeat(seat: SeatInfo) {
    if (seat.occupied) return;

    const index = this.selectedSeats.indexOf(seat.seatNo);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
      this.totalPrice -= seat.price;
    } else {
      this.selectedSeats.push(seat.seatNo);
      this.totalPrice += seat.price;
    }
    this.cdr.detectChanges();
  }

  isSeatSelected(seatNo: string): boolean {
    return this.selectedSeats.includes(seatNo);
  }

  getSeatClass(seat: SeatInfo): string {
    let classes = 'seat';
    if (seat.type === 'PREMIUM') classes += ' vip';
    if (seat.occupied) classes += ' occupied';
    if (this.isSeatSelected(seat.seatNo)) classes += ' selected';
    return classes;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  toggleOneTap() {
    if (!this.userId) {
      this.toastService.showError("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    this.authService.toggleOneTap(this.userId).subscribe({
      next: (res) => {
        this.isOneTapEnabled = !this.isOneTapEnabled;
        this.toastService.showSuccess(res);
        this.cdr.detectChanges();
      },
      error: (err) => {
        let errorMsg = err.error || "Không thể thay đổi cài đặt thanh toán";
        
        // Handle specific "no payment method" error from backend
        if (typeof errorMsg === 'string' && errorMsg.includes('phương thức thanh toán')) {
          this.toastService.showError("Bạn chưa có thẻ thanh toán. Vui lòng vào Cài đặt để thêm thẻ trước khi bật tính năng này!");
        } else {
          this.toastService.showError(errorMsg);
        }
      }
    });
  }

  onBook() {
    if (!this.selectedShowId || this.selectedSeats.length === 0) {
      this.toastService.showError("Vui lòng chọn suất chiếu và ghế ngồi!");
      return;
    }

    if (!this.userId) {
      this.showAuthModal = true;
      return;
    }

    const selectedShow = this.shows.find(s => (s.showId || s.id) === this.selectedShowId);
    const selectedTheater = this.theaters.find(t => t.id === this.selectedTheaterId);

    const bookingInfo = {
      movie: selectedShow?.movie,
      theater: selectedTheater,
      show: selectedShow,
      seats: this.selectedSeats,
      totalPrice: this.totalPrice,
      showId: this.selectedShowId,
      userId: this.userId
    };

    if (this.isOneTapEnabled) {
      this.isBooking = true;
      this.cdr.detectChanges();
      
      const payload = {
        showId: bookingInfo.showId,
        userId: bookingInfo.userId,
        requestSeats: bookingInfo.seats
      };

      this.bookingService.bookTicket(payload).subscribe({
        next: (res) => {
          this.toastService.showSuccess('Thanh toán thành công! Vé đã được đặt (1-Tap).');
          this.router.navigate(['/tickets']);
        },
        error: (err) => {
          this.isBooking = false;
          this.toastService.showError('Thanh toán thất bại: ' + (err.error || 'Lỗi máy chủ / Ghế trống không hợp lệ'));
          this.loadBookingData(); // Refresh seat grid
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isBooking = true;
      this.cdr.detectChanges();

      const payload = {
        showId: bookingInfo.showId,
        userId: bookingInfo.userId,
        requestSeats: bookingInfo.seats
      };

      // Proceed to normal checkout by initiating a 5-minute hold on the seats
      this.bookingService.holdSeats(payload).subscribe({
        next: (res: string) => {
          // res is now the epoch milliseconds string from backend
          sessionStorage.setItem('seatHoldEndTime', res);
          this.isBooking = false;
          this.router.navigate(['/payment'], { 
            state: { bookingInfo }
          });
        },
        error: (err) => {
          this.isBooking = false;
          this.toastService.showError('Ghế đã bị người khác chọn hoặc đang được giữ. Vui lòng chọn lại!');
          this.loadBookingData(); // Refresh seat grid dynamically
          this.cdr.detectChanges();
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/auth'], { queryParams: { returnUrl: `/booking/${this.movieId}` } });
  }

  goToRegister() {
    this.router.navigate(['/auth'], { queryParams: { mode: 'register', returnUrl: `/booking/${this.movieId}` } });
  }
}

