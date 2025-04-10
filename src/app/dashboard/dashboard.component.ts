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

  showLoginTooltip(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const tooltip = target.querySelector('.login-tooltip') as HTMLElement;
    if (tooltip) {
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    }
  }

  hideLoginTooltip() {
    const tooltips = document.querySelectorAll('.login-tooltip');
    tooltips.forEach(tooltip => {
      (tooltip as HTMLElement).style.opacity = '0';
      (tooltip as HTMLElement).style.visibility = 'hidden';
    });
  }

  showLoginPrompt(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const prompt = target.querySelector('.login-prompt') as HTMLElement;
    if (prompt) {
      prompt.style.opacity = '1';
      prompt.style.pointerEvents = 'auto';
      prompt.style.top = '-40px';
    }
  }

  hideLoginPrompt() {
    const prompts = document.querySelectorAll('.login-prompt');
    prompts.forEach(prompt => {
      (prompt as HTMLElement).style.opacity = '0';
      (prompt as HTMLElement).style.pointerEvents = 'none';
      (prompt as HTMLElement).style.top = '-30px';
    });
  }
}