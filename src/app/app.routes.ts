import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';


export const routes: Routes = [
  {path: '', component: DashboardComponent},
  // { path: '**', redirectTo: '', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent},
  {path: 'home', component: HomeComponent},
  
];
