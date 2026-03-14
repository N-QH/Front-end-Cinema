import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

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
  
  selectedTheaterId: number | null = null;
  selectedShowId: number | null = null;
  
  seats: SeatInfo[] = [];
  seatRows: string[] = [];
  selectedSeats: string[] = []; // Store seatNo for display
  selectedSeatNos: string[] = []; // Redundant but keeping consistent
  totalPrice = 0;
  userId: number = 1;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private authService: AuthService,
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
        if (user && user.userId) {
          this.userId = user.userId;
        }
      });
    }
  }

  loadBookingData() {
    this.bookingService.getTheaters().subscribe(res => {
      this.theaters = res;
      if (this.theaters.length > 0) this.selectedTheaterId = this.theaters[0].id;
      this.cdr.detectChanges();
    });

    if (this.movieId) {
      this.bookingService.getShowsByMovieId(this.movieId).subscribe(res => {
        this.shows = res;
        this.cdr.detectChanges();
      });
    }
  }

  selectShow(show: any) {
    this.selectedShowId = show.showId || show.id;
    this.selectedSeats = [];
    this.totalPrice = 0;
    
    // Load seats for this show
    if (show.showSeatList) {
      this.seats = show.showSeatList.map((s: any) => ({
        id: s.id,
        seatNo: s.seatNo,
        type: s.seatType,
        price: s.price,
        occupied: !s.isAvailable
      }));
      
      // Organize into rows
      const rowsSet = new Set<string>();
      this.seats.forEach(s => {
        const rowMatch = s.seatNo.match(/[A-Z]+/);
        if (rowMatch) rowsSet.add(rowMatch[0]);
      });
      this.seatRows = Array.from(rowsSet).sort();
    }
    this.cdr.detectChanges();
  }

  getSeatsForRow(row: string): SeatInfo[] {
    return this.seats.filter(s => s.seatNo.startsWith(row));
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

  onBook() {
    if (!this.selectedShowId || this.selectedSeats.length === 0) {
      alert("Vui lòng chọn suất chiếu và ghế ngồi!");
      return;
    }

    const payload = {
      showId: this.selectedShowId,
      userId: this.userId,
      requestSeats: this.selectedSeats
    };

    this.bookingService.bookTicket(payload).subscribe({
      next: (res) => {
        alert("Đặt vé thành công!");
        this.selectedSeats = [];
        this.totalPrice = 0;
        // Refresh show data to update seat occupancy
        if (this.movieId) {
          this.bookingService.getShowsByMovieId(this.movieId).subscribe(shows => {
            this.shows = shows;
            const updatedShow = shows.find((s: any) => (s.showId || s.id) === this.selectedShowId);
            if (updatedShow) this.selectShow(updatedShow);
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        alert("Đặt vé thất bại: " + (err.error || "Lỗi máy chủ"));
      }
    });
  }
}

