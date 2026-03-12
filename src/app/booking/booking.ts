import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';
import { FormsModule } from '@angular/forms';

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
  
  // Dummy seats for now
  selectedSeats: string[] = [];
  totalPrice = 0;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieId = +id;
      this.loadBookingData();
    }
  }

  loadBookingData() {
    this.bookingService.getTheaters().subscribe(res => {
      this.theaters = res;
      if (this.theaters.length > 0) this.selectedTheaterId = this.theaters[0].id;
    });

    if (this.movieId) {
      this.bookingService.getShowsByMovieId(this.movieId).subscribe(res => {
        this.shows = res;
      });
    }
  }

  toggleSeat(seatId: string) {
    const index = this.selectedSeats.indexOf(seatId);
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
      this.totalPrice -= 90000; // Base price
    } else {
      this.selectedSeats.push(seatId);
      this.totalPrice += 90000;
    }
  }

  isSeatSelected(seatId: string): boolean {
    return this.selectedSeats.includes(seatId);
  }

  onBook() {
    if (!this.selectedTheaterId || !this.selectedShowId || this.selectedSeats.length === 0) {
      alert("Vui lòng chọn rạp, suất chiếu và ghế ngồi!");
      return;
    }

    const payload = {
      amount: this.totalPrice,
      noOfSeats: this.selectedSeats.length,
      userId: 1, // Assuming logged in as user 1 for now, optionally decode JWT
      showId: this.selectedShowId,
      theaterId: this.selectedTheaterId,
      bookSeats: this.selectedSeats
    };

    this.bookingService.bookTicket(payload).subscribe({
      next: (res) => {
        alert("Booking successful!");
        this.selectedSeats = [];
        this.totalPrice = 0;
      },
      error: (err) => {
        alert("Failed to book tickets. Please try again.");
      }
    });
  }
}
