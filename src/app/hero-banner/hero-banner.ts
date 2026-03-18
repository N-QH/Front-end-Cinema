import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService } from '../services/movie.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-banner',
  imports: [RouterLink, CommonModule],
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css',
})
export class HeroBanner implements OnInit {
  bannerMovies: any[] = [];
  currentIndex = 0;
  autoSlideTimer: any;

  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.movieService.getMovies().subscribe({
      next: (movies) => {
        this.bannerMovies = movies.filter(m => m.isBanner);
        if (this.bannerMovies.length === 0 && movies.length > 0) {
          this.bannerMovies = [movies[0]]; // Fallback to first movie
        }
        this.currentIndex = 0;
        this.startAutoSlide();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  startAutoSlide() {
    this.stopAutoSlide();
    if (this.bannerMovies.length > 1) {
      this.autoSlideTimer = setInterval(() => {
        this.nextBanner();
      }, 5000);
    }
  }

  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  nextBanner() {
    if (this.bannerMovies.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.bannerMovies.length;
      this.cdr.detectChanges();
    }
  }

  prevBanner() {
    if (this.bannerMovies.length > 1) {
      this.currentIndex = (this.currentIndex - 1 + this.bannerMovies.length) % this.bannerMovies.length;
      this.cdr.detectChanges();
    }
  }

  setCurrentIndex(index: number) {
    this.currentIndex = index;
    this.startAutoSlide();
    this.cdr.detectChanges();
  }
}
