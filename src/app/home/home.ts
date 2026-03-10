import { Component } from '@angular/core';
import { HeroBanner } from '../hero-banner/hero-banner';
import { MovieList } from '../movie-list/movie-list';

@Component({
  selector: 'app-home',
  imports: [HeroBanner, MovieList],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
