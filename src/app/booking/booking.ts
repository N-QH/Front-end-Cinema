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
  
  selectedTheaterId: number | null = null;
  selectedShowId: number | null = null;
  
  seats: SeatInfo[] = [];
  seatRows: string[] = [];
  selectedSeats: string[] = []; // Store seatNo for display
  selectedSeatNos: string[] = []; // Redundant but keeping consistent
  totalPrice = 0;
  userId: number | null = null;

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

  onBook() {
    if (!this.selectedShowId || this.selectedSeats.length === 0) {
      this.toastService.showError("Vui lòng chọn suất chiếu và ghế ngồi!");
      return;
    }

    const selectedShow = this.shows.find(s => (s.showId || s.id) === this.selectedShowId);
    const selectedTheater = this.theaters.find(t => t.id === this.selectedTheaterId);

    this.router.navigate(['/payment'], { 
      state: { 
        bookingInfo: {
          movie: selectedShow?.movie,
          theater: selectedTheater,
          show: selectedShow,
          seats: this.selectedSeats,
          totalPrice: this.totalPrice,
          showId: this.selectedShowId,
          userId: this.userId
        }
      }
    });
  }
}

