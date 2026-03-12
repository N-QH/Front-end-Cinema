import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-admin-shows',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './admin-shows.html',
  styleUrl: '../admin/admin.css',
})
export class AdminShows implements OnInit {
  showAddModal = false;
  isLoading = false;
  isFetching = true;
  message: string | null = null;
  error: string | null = null;
  
  shows: any[] = [];
  movies: any[] = [];
  theaters: any[] = [];

  showData = {
    showDate: '',
    showTime: '',
    movieId: null,
    theaterId: null
  };

  constructor(
    private bookingService: BookingService,
    private movieService: MovieService
  ) {}

  ngOnInit() {
    this.loadShows();
    this.loadLookups();
  }

  loadShows() {
    this.isFetching = true;
    this.bookingService.getShows().subscribe({
      next: (res) => {
        this.shows = res;
        this.isFetching = false;
      },
      error: () => this.isFetching = false
    });
  }

  loadLookups() {
    this.movieService.getMovies().subscribe(res => this.movies = res);
    this.bookingService.getTheaters().subscribe(res => this.theaters = res);
  }

  getMovieName(movieId: number): string {
    const movie = this.movies.find(m => m.id === movieId);
    return movie ? movie.movieName : `ID: ${movieId}`;
  }

  getTheaterName(theaterId: number): string {
    const theater = this.theaters.find(t => t.id === theaterId);
    return theater ? theater.name : `ID: ${theaterId}`;
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

    this.bookingService.addShow(this.showData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = 'Thêm lịch chiếu thành công!';
        this.loadShows();
        setTimeout(() => this.closeAddModal(), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error || 'Lỗi khi thêm lịch chiếu';
      }
    });
  }

  deleteShow(id: number) {
    if(confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
      this.bookingService.deleteShow(id).subscribe({
        next: () => {
          this.loadShows();
        },
        error: (err) => {
          alert('Không thể xóa suất chiếu này.');
        }
      });
    }
  }
}
