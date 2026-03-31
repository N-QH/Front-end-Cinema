import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isAdmin = false;
  userImage: string | null = null;
  searchTerm: string = '';
  searchResults: any[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    public authService: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(() => {
      this.checkAdminRole();
    });

    this.authService.userProfile$.subscribe(user => {
      this.userImage = user?.userImage || null;
      this.cdr.detectChanges();
    });

    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.trim().length < 2) {
          return of([]);
        }
        return this.bookingService.searchMovies(term);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.cdr.detectChanges();
      },
      error: () => {
        this.searchResults = [];
        this.cdr.detectChanges();
      }
    });
  }

  checkAdminRole() {
    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe({
        next: (user) => {
          this.isAdmin = user?.roles?.includes('ADMIN') || false;
          this.cdr.detectChanges();
        },
        error: () => this.isAdmin = false
      });
    }
  }

  logout(event: Event) {
    event.stopPropagation();
    this.authService.logout();
    this.isAdmin = false;
    this.router.navigate(['/']);
  }

  onSearchInput(event: any) {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.cdr.detectChanges();
  }

  goToMovie(movieId: number) {
    this.clearSearch();
    this.router.navigate(['/movie', movieId]);
  }
}
