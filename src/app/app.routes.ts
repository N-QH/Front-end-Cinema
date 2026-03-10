import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Auth } from './auth/auth';
import { MovieDetails } from './movie-details/movie-details';
import { Booking } from './booking/booking';
import { Payment } from './payment/payment';
import { Tickets } from './tickets/tickets';
import { Admin } from './admin/admin';
import { Reports } from './reports/reports';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'auth', component: Auth },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'booking/:id', component: Booking },
  { path: 'payment', component: Payment },
  { path: 'tickets', component: Tickets },
  { path: 'admin', component: Admin },
  { path: 'admin/reports', component: Reports }
];
