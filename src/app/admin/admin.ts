import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';
import { ToastService } from '../services/toast.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  showAddModal = false;
  showDeleteConfirm = false;
  movieToDeleteId: number | null = null;
  isEditing = false;
  currentMovieId: number | null = null;
  isLoading = false;
  isFetching = true;
  message: string | null = null;
  error: string | null = null;
  
  movies: any[] = [];
  stats: any = {
    ticketsToday: 0,
    activeMovies: 0,
    revenueToday: 0,
    totalUsers: 0
  };

  movieData = {
    movieName: '',
    duration: 120,
    releaseDate: '2026-10-12',
    genres: [] as string[],
    language: 'ENGLISH',
    description: '',
    movieImage: ''
  };

  allGenres = [
    'ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'SCI_FI', 'THRILLER',
    'ROMANCE', 'ANIMATION', 'DOCUMENTARY', 'ADVENTURE', 'FANTASY',
    'MYSTERY', 'CRIME', 'WESTERN'
  ];

  constructor(
    private movieService: MovieService, 
    private cdr: ChangeDetectorRef, 
    private toastService: ToastService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadMovies();
    this.loadStats();
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
      }
    });
  }

  loadMovies() {
    this.isFetching = true;
    this.movieService.getMovies().subscribe({
      next: (res) => {
        this.movies = res;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentMovieId = null;
    this.resetForm();
    this.showAddModal = true;
    this.message = null;
    this.error = null;
  }

  openEditModal(movie: any) {
    this.isEditing = true;
    this.currentMovieId = movie.id;
    this.movieData = {
      movieName: movie.movieName,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      genres: movie.genre ? movie.genre.split(',').map((g: string) => g.trim()) : [],
      language: movie.language,
      description: movie.description,
      movieImage: movie.movieImage
    };
    this.showAddModal = true;
    this.message = null;
    this.error = null;
  }

  toggleGenre(genre: string) {
    const index = this.movieData.genres.indexOf(genre);
    if (index > -1) {
      this.movieData.genres.splice(index, 1);
    } else {
      this.movieData.genres.push(genre);
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.movieData.genres.includes(genre);
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  onDelete(movieId: number) {
    this.movieToDeleteId = movieId;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.movieToDeleteId = null;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.movieToDeleteId) {
      this.movieService.deleteMovie(this.movieToDeleteId).subscribe({
        next: () => {
          this.toastService.showSuccess('Xóa phim thành công!');
          this.loadMovies();
          this.cancelDelete();
        },
        error: (err) => {
          this.toastService.showError('Xóa phim thất bại: ' + (err.error || 'Lỗi server'));
          this.cancelDelete();
        }
      });
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.message = null;
    this.error = null;

    const payload = {
      ...this.movieData,
      genre: this.movieData.genres.join(',')
    };

    if (this.isEditing && this.currentMovieId) {
      this.movieService.updateMovie(this.currentMovieId, payload).subscribe({
        next: (res) => {
          this.handleSuccess('Cập nhật phim thành công!');
        },
        error: (err) => {
          this.handleError(err, 'Cập nhật phim thất bại');
        }
      });
    } else {
      this.movieService.addMovie(payload).subscribe({
        next: (res) => {
          this.handleSuccess('Thêm phim thành công!');
        },
        error: (err) => {
          this.handleError(err, 'Thêm phim thất bại');
        }
      });
    }
  }

  private handleSuccess(msg: string) {
    this.isLoading = false;
    this.toastService.showSuccess(msg);
    this.resetForm();
    this.loadMovies();
    this.closeAddModal();
    this.cdr.detectChanges();
  }

  private handleError(err: any, defaultMsg: string) {
    this.isLoading = false;
    this.error = err.error || defaultMsg;
    this.toastService.showError(this.error!);
    this.cdr.detectChanges();
  }

  setAsBanner(movieId: number) {
    this.movieService.setMovieBanner(movieId).subscribe({
      next: () => {
        this.toastService.showSuccess('Đã đặt làm phim Banner!');
        this.loadMovies();
      },
      error: (err) => {
        this.toastService.showError('Cập nhật Banner thất bại: ' + (err.error || 'Lỗi server'));
      }
    });
  }

  resetForm() {
    this.movieData = {
      movieName: '',
      duration: 120,
      releaseDate: '2026-10-12',
      genres: [],
      language: 'ENGLISH',
      description: '',
      movieImage: ''
    };
  }
}
