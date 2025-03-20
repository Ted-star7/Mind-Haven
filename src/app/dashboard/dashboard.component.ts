import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: []
})
export class DashboardComponent {
  isMenuOpen = false; 

  constructor(private router: Router) { }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; 
  }
}