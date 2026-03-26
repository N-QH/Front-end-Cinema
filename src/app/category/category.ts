import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        try {
          const now = new Date();
          this.movies = data.map((m: any) => {
            let isUpcoming = false;
            if (m.releaseDate) {
              const parts = m.releaseDate.split('/');
              let releaseDate;
              if (parts.length === 3) {
                releaseDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
              } else {
                releaseDate = new Date(m.releaseDate);
              }
              isUpcoming = releaseDate > now;
            }
            return {
              ...m,
              isUpcoming: isUpcoming
            };
          });
          
          this.isLoading = false;
          this.applyFilters();
          
          // Auto-switch to COMING_SOON if NOW_SHOWING is empty
          if (this.filteredMovies.length === 0 && this.activeTab === 'NOW_SHOWING') {
            if (this.movies.some(m => m.isUpcoming)) {
              this.activeTab = 'COMING_SOON';
              this.applyFilters();
            }
          }
          
          // Force UI update
          this.cdr.detectChanges();
        } catch (e) {
          console.error('Error processing movie data:', e);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
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
