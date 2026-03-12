import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';

@Component({
  selector: 'app-tickets',
  imports: [RouterLink, CommonModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  tickets: any[] = [];
  isLoading = true;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.getUserTickets(1).subscribe({
      next: (res) => {
        this.tickets = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
