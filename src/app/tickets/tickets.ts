import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../services/booking.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tickets',
  imports: [RouterLink, CommonModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets implements OnInit {
  tickets: any[] = [];
  isLoading = true;
  userId: number | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe({
        next: (user) => {
          if (user && user.id) {
            this.userId = user.id;
            this.loadTickets();
          } else {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  loadTickets() {
    if (!this.userId) return;
    this.bookingService.getUserTickets(this.userId).subscribe({
      next: (res) => {
        this.tickets = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(price: number): string {
    if (!price) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }
}
