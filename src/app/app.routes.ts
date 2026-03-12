import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Auth } from './auth/auth';
import { MovieDetails } from './movie-details/movie-details';
import { Booking } from './booking/booking';
import { Payment } from './payment/payment';
import { Tickets } from './tickets/tickets';
import { Admin } from './admin/admin';
import { Reports } from './reports/reports';
import { AdminTheaters } from './admin-theaters/admin-theaters';
import { AdminShows } from './admin-shows/admin-shows';
import { Profile } from './profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'auth', component: Auth },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'booking/:id', component: Booking },
  { path: 'payment', component: Payment },
  { path: 'tickets', component: Tickets },
  { path: 'profile', component: Profile },
  { path: 'admin', component: Admin },
  { path: 'admin/theaters', component: AdminTheaters },
  { path: 'admin/shows', component: AdminShows },
  { path: 'admin/reports', component: Reports }
];
