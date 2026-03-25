import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieService } from '../services/movie.service';
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

  openTrailer() {
    this.showTrailer = true;
  }

  closeTrailer() {
    this.showTrailer = false;
  }

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
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
}

