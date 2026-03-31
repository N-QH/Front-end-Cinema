import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieItem } from '../movie-item/movie-item';
import { Pagination } from '../pagination/pagination';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-category',
  imports: [MovieItem, CommonModule],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  isLoading = true;

  activeTab: 'NOW_SHOWING' | 'COMING_SOON' = 'NOW_SHOWING';
  showGenreDropdown = false;
  showAgeDropdown = false;
  
  // Genre data for the filter bar
  availableGenres: string[] = ['ACTION', 'COMEDY', 'DRAMA', 'HORROR', 'ROMANCE', 'SCI_FI', 'THRILLER', 'ANIMATION', 'ADVENTURE'];
  selectedGenres: string[] = [];
  
  // Age rating filter
  availableAgeRatings: string[] = ['P', '13', '16', '18'];
  selectedAgeRatings: string[] = [];
  
  ageTranslations: any = {
    'P': 'Mọi lứa tuổi (P)',
    '13': 'Từ 13 tuổi (13+)',
    '16': 'Từ 16 tuổi (16+)',
    '18': 'Từ 18 tuổi (18+)'
  };
  
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

  toggleAgeRating(age: string) {
    const index = this.selectedAgeRatings.indexOf(age);
    if (index > -1) {
      this.selectedAgeRatings.splice(index, 1);
    } else {
      this.selectedAgeRatings.push(age);
    }
    this.applyFilters();
  }

  groupedMovies: { genre: string, movies: any[] }[] = [];

  applyFilters() {
    // Stage 1: Filter by tab (Now Showing / Coming Soon)
    let tabFiltered = this.movies.filter(movie => {
      const matchTab = this.activeTab === 'NOW_SHOWING' ? !movie.isUpcoming : movie.isUpcoming;
      return matchTab;
    });

    // Stage 1.5: Filter by age rating if any are selected
    if (this.selectedAgeRatings.length > 0) {
      tabFiltered = tabFiltered.filter(movie => {
        const movieAge = movie.ageRequirement ? String(movie.ageRequirement) : 'P';
        return this.selectedAgeRatings.includes(movieAge);
      });
    }

    // Stage 2: Group by genres
    // If genres are selected, only show those genre blocks.
    // If no genre is selected, show all sections that have movies.
    const genresToProcess = this.selectedGenres.length > 0 ? this.selectedGenres : this.availableGenres;

    this.groupedMovies = genresToProcess.map(genre => {
      const moviesInGenre = tabFiltered.filter(movie => {
        const movieGenres = movie.genre ? movie.genre.split(',').map((g: string) => g.trim()) : [];
        return movieGenres.includes(genre);
      });
      return { genre, movies: moviesInGenre };
    }).filter(group => group.movies.length > 0);

    // Fallback for flat filtered list if needed by legacy parts (optional)
    this.filteredMovies = tabFiltered.filter(movie => {
        const movieGenres = movie.genre ? movie.genre.split(',').map((g: string) => g.trim()) : [];
        return this.selectedGenres.length === 0 || this.selectedGenres.some(g => movieGenres.includes(g));
    });
  }

  scrollRow(container: HTMLElement, direction: 'left' | 'right') {
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }
}
