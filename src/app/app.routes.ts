import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TherapyCentreComponent } from './therapy-centre/therapy-centre.component';
import { ContactComponent } from './contact/contact.component';


export const routes: Routes = [
  {path: '', component: DashboardComponent},
  // { path: '**', redirectTo: '', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent},
  {path: 'home', component: HomeComponent},
  {path: 'therapy-centre', component: TherapyCentreComponent},
  {path: 'resetpassword', component: ResetPasswordComponent},
  {path: 'contact', component:ContactComponent}
  
];
