import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-details',
  imports: [RouterLink, CommonModule],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit, OnDestroy {
  movie: any = null;
  isLoading = true;
  showTrailer = false;
  safeTrailerUrl: SafeResourceUrl | null = null;
  userAge: number | null = null;

  isFavorite: boolean = false;
  private favSub?: Subscription;

  openTrailer() {
    this.showTrailer = true;
  }

  closeTrailer() {
    this.showTrailer = false;
  }

  get isLoggedIn(): boolean {
    return this.authService.getCurrentUserId() !== null;
  }

  toggleFavorite() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      alert("Vui lòng đăng nhập để lưu phim yêu thích!");
      return;
    }

    // Optimistic update
    this.isFavorite = !this.isFavorite;
    this.cdr.detectChanges();

    this.authService.toggleFavoriteMovie(userId, this.movie.id).subscribe({
      next: (res) => {
        // AuthService will re-emit favoriteMovies$, subscription syncs state
      },
      error: (err) => {
        // Revert on error
        this.isFavorite = !this.isFavorite;
        this.cdr.detectChanges();
        console.error("Lỗi khi thêm phim yêu thích", err);
      }
    });
  }

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnDestroy() {
    if (this.favSub) {
      this.favSub.unsubscribe();
    }
  }

  ngOnInit() {
    // Subscribe to favorites state so button updates reactively
    this.favSub = this.authService.favoriteMovies$.subscribe(ids => {
      if (this.movie) {
        this.isFavorite = ids.includes(this.movie.id);
        this.cdr.detectChanges();
      }
    });

    const email = this.authService.getUserEmail();
    if (email) {
      this.authService.getUserByEmail(email).subscribe({
        next: (user) => {
          if (user && user.age !== undefined && user.age !== null) {
            this.userAge = user.age;
          }
        }
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieService.getMovieById(+id).subscribe({
        next: (data) => {
          this.movie = data;
          try {
            this.movie.parsedActors = JSON.parse(this.movie.actors);
            if (!Array.isArray(this.movie.parsedActors)) this.movie.parsedActors = [];
          } catch (e) {
            this.movie.parsedActors = this.movie.actors ? this.movie.actors.split(',').map((a: string) => ({ name: a.trim(), imageUrl: '' })) : [];
          }
          if (this.movie.trailerUrl) {
            this.safeTrailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.movie.trailerUrl);
          }
          this.isLoading = false;
          // Sync favorite state now that movie.id is known
          this.isFavorite = this.authService.favoriteMovieIds.includes(this.movie.id);
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  get isAgeRestricted(): boolean {
    if (this.userAge === null) return false;
    if (!this.movie || !this.movie.ageRequirement || this.movie.ageRequirement === 'P') return false;
    
    const requiredAge = parseInt(this.movie.ageRequirement);
    if (isNaN(requiredAge)) return false;
    
    return this.userAge < requiredAge;
  }
}


