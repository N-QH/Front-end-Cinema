import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MovieItem } from '../movie-item/movie-item';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink, MovieItem],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class Favorites implements OnInit {
  isLoading = true;
  favoriteMovies: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;
    const email = this.authService.getUserEmail();
    
    if (!email) {
      this.router.navigate(['/auth']);
      return;
    }

    this.authService.getUserByEmail(email).subscribe({
      next: (user) => {
        if (user && user.favoriteMovies) {
          this.favoriteMovies = user.favoriteMovies;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
