import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-item',
  imports: [RouterLink, CommonModule],
  templateUrl: './movie-item.html',
  styleUrl: './movie-item.css',
  host: {
    'style': 'display: block; width: 100%;'
  }
})
export class MovieItem implements OnInit, OnDestroy {
  @Input() movie: any;
  @Input() gridMode: boolean = false;
  
  isFavorite: boolean = false;
  private favSub?: Subscription;

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.favSub = this.authService.favoriteMovies$.subscribe(ids => {
      if (this.movie) {
        this.isFavorite = ids.includes(this.movie.id);
        this.cdr.detectChanges();
      }
    });
  }
  
  ngOnDestroy() {
    if (this.favSub) {
      this.favSub.unsubscribe();
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.getCurrentUserId() !== null;
  }

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      alert("Vui lòng đăng nhập để lưu phim yêu thích!");
      return;
    }

    // Optimistically update
    this.isFavorite = !this.isFavorite;
    this.cdr.detectChanges();

    this.authService.toggleFavoriteMovie(userId, this.movie.id).subscribe({
      next: (res) => {
        // State is updated in AuthService, which re-emits to favoriteMovies$ if anything structurally changed
      },
      error: (err) => {
        console.error("Lỗi khi thêm phim yêu thích", err);
      }
    });
  }
}
