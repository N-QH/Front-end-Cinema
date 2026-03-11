import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  showAddModal = false;
  isLoading = false;
  message: string | null = null;
  error: string | null = null;

  movieData = {
    movieName: '',
    duration: 120,
    rating: 8.5,
    releaseDate: '2026-10-12',
    genre: 'ACTION',
    language: 'ENGLISH'
  };

  constructor(private movieService: MovieService) {}

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
        this.message = 'Movie added successfully!';
        setTimeout(() => this.closeAddModal(), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error || 'Failed to add movie';
      }
    });
  }
}
