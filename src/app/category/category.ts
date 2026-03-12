import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieItem } from '../movie-item/movie-item';
import { Pagination } from '../pagination/pagination';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-category',
  imports: [MovieItem, Pagination, CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  isLoading = true;

  activeTab: 'NOW_SHOWING' | 'COMING_SOON' = 'NOW_SHOWING';
  showGenreDropdown = false;
  
  // Fake genre data for the filter bar
  availableGenres: string[] = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'SCI_FI', 'THRILLER', 'ANIMATION', 'ADVENTURE'];
  selectedGenres: string[] = [];
  
  genreTranslations: any = {
    'ACTION': 'Hành động',
    'COMEDY': 'Hài',
    'DRAMA': 'Tâm lý',
    'HORROR': 'Kinh dị',
    'ROMANCE': 'Tình cảm',
    'SCI_FI': 'Viễn tưởng',
    'THRILLER': 'Giật gân',
    'ANIMATION': 'Hoạt hình',
    'ADVENTURE': 'Phiêu lưu'
  };

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        // Assign random genres and release dates for mock testing if missing
        this.movies = data.map((m: any) => ({
          ...m,
          genre: m.genre || this.availableGenres[Math.floor(Math.random() * this.availableGenres.length)],
          isUpcoming: Math.random() > 0.5 // mock 50% chance if real logic is too complex without proper data
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  setTab(tab: 'NOW_SHOWING' | 'COMING_SOON') {
    this.activeTab = tab;
    this.applyFilters();
  }

  toggleGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);
    if (index > -1) {
      this.selectedGenres.splice(index, 1);
    } else {
      this.selectedGenres.push(genre);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredMovies = this.movies.filter(movie => {
      // Filter by tab
      const matchTab = this.activeTab === 'NOW_SHOWING' ? !movie.isUpcoming : movie.isUpcoming;
      
      // Filter by genre
      const matchGenre = this.selectedGenres.length === 0 || this.selectedGenres.includes(movie.genre);

      return matchTab && matchGenre;
    });
  }
}
