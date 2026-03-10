import { Component } from '@angular/core';
import { MovieItem } from '../movie-item/movie-item';
import { Pagination } from '../pagination/pagination';

@Component({
  selector: 'app-movie-list',
  imports: [MovieItem, Pagination],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css',
})
export class MovieList {}
