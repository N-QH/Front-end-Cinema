import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../services/movie.service';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-details',
  imports: [RouterLink, CommonModule],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css',
})
export class MovieDetails implements OnInit {
  movie: any = null;
  isLoading = true;
  showTrailer = false;
  safeTrailerUrl: SafeResourceUrl | null = null;
  userAge: number | null = null;

  openTrailer() {
    this.showTrailer = true;
  }

  closeTrailer() {
    this.showTrailer = false;
  }

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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


