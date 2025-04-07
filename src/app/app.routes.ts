import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TherapyCentreComponent } from './therapy-centre/therapy-centre.component';
import { ContactComponent } from './contact/contact.component';
import { TherapyComponent } from './therapy/therapy.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { JournalComponent } from './journal/journal.component';
import { ArticlesComponent } from './articles/articles.component';
import { MainComponent } from './main/main.component';
import { CommunityComponent } from './community/community.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component';


export const routes: Routes = [
  {path: '', component: DashboardComponent},
  // { path: '**', redirectTo: '', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent},
  {path: 'home', component: HomeComponent},
  {path: 'therapy', component:TherapyComponent},
  {path: 'therapy-centre', component: TherapyCentreComponent},
  {path: 'resetpassword', component: ResetPasswordComponent},
  {path: 'contact', component:ContactComponent},
  {path: 'sidebar', component: SidebarComponent},
  {path: 'journal', component: JournalComponent},
  {path: 'articles', component: ArticlesComponent},
  {path: 'dashboard', component: MainComponent},
  {path: 'community', component: CommunityComponent},
  {path: 'mindhaven-ai', component: ChatBotComponent}
  
];
