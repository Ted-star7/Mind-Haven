import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Mind-Haven';
  hideSidebar = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects;
        this.hideSidebar = [
          '/',
          '/resetpassword',
          '/therapy-centre',
          '/therapy',
          '/contact',
          '/home',
          '/signup',
        ].includes(currentRoute);

        console.log('Current Route:', currentRoute, 'Sidebar Hidden:', this.hideSidebar);
      }
    });
  }
}
