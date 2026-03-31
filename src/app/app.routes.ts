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
import { Category } from './category/category';
import { AdminCustomers } from './admin-customers/admin-customers';
import { ForgotPassword } from './forgot-password/forgot-password';
import { Settings } from './settings/settings';
import { AdminCoupons } from './admin-coupons/admin-coupons';
import { Favorites } from './favorites/favorites';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'category', component: Category },
  { path: 'auth', component: Auth },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'movie/:id', component: MovieDetails },
  { path: 'favorites', component: Favorites },
  { path: 'booking/:id', component: Booking },
  { path: 'payment', component: Payment },
  { path: 'tickets', component: Tickets },
  { path: 'profile', component: Profile },
  { path: 'settings', component: Settings },
  { path: 'admin', component: Admin, canActivate: [AdminGuard] },
  { path: 'admin/theaters', component: AdminTheaters, canActivate: [AdminGuard] },
  { path: 'admin/shows', component: AdminShows, canActivate: [AdminGuard] },
  { path: 'admin/reports', component: Reports, canActivate: [AdminGuard] },
  { path: 'admin/customers', component: AdminCustomers, canActivate: [AdminGuard] },
  { path: 'admin/coupons', component: AdminCoupons, canActivate: [AdminGuard] }
];
