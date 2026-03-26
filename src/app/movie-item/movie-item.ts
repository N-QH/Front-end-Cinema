import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-item',
  imports: [RouterLink, CommonModule],
  templateUrl: './movie-item.html',
  styleUrl: './movie-item.css',
  host: {
    'style': 'display: block; width: 100%;'
  }
})
export class MovieItem {
  @Input() movie: any;
  @Input() gridMode: boolean = false;
}
