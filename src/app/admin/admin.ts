import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  showAddModal = false;
  isLoading = false;
  isFetching = true;
  message: string | null = null;
  error: string | null = null;
  
  movies: any[] = [];

  movieData = {
    movieName: '',
    duration: 120,
    rating: 8.5,
    releaseDate: '2026-10-12',
    genre: 'ACTION',
    language: 'ENGLISH',
    description: '',
    movieImage: ''
  };

  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef, private toastService: ToastService) {}

  ngOnInit() {
    this.loadMovies();
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
    this.showAddModal = true;
    this.message = null;
    this.error = null;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onSubmit() {
    this.isLoading = true;
    this.message = null;
    this.error = null;

    this.movieService.addMovie(this.movieData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.showSuccess('Thêm phim thành công!');
        this.resetForm();
        this.loadMovies();
        this.closeAddModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error || 'Thêm phim thất bại';
        this.toastService.showError(this.error!);
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.movieData = {
      movieName: '',
      duration: 120,
      rating: 8.5,
      releaseDate: '2026-10-12',
      genre: 'ACTION',
      language: 'ENGLISH',
      description: '',
      movieImage: ''
    };
  }
}
