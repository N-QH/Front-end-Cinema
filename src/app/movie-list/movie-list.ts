import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieItem } from '../movie-item/movie-item';
import { Pagination } from '../pagination/pagination';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-movie-list',
  imports: [MovieItem, Pagination, CommonModule],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css',
})
export class MovieList implements OnInit {
  movies: any[] = [];
  isLoading = true;

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        // Just show all movies on the home page, or limit to 8
        this.movies = data.slice(0, 8); 
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}
