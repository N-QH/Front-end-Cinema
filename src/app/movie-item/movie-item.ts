import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-movie-item',
  imports: [RouterLink],
  templateUrl: './movie-item.html',
  styleUrl: './movie-item.css',
})
export class MovieItem {}
