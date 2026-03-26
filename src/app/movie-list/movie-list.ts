import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  allMovies: any[] = [];
  pagedMovies: any[] = [];
  isLoading = true;
  
  currentPage = 1;
  pageSize = 8;
  totalPages = 0;

  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        this.allMovies = data;
        this.updatePagination();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.allMovies.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedMovies = this.allMovies.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePagination();
    this.cdr.detectChanges();
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

