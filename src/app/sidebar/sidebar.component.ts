import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isSidebarOpen = false;
  userEmail: string = '';

  constructor(private sessionService: SessionService) { }

  ngOnInit(): void {
    this.userEmail = this.sessionService.getemail() || 'User';
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Lock body scroll when sidebar is open
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : '';
    // Force reflow for smoother animation
    document.body.clientWidth;
  }

  closeSidebar(): void {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
      document.body.style.overflow = '';
    }
  }

  logout(): void {
    this.sessionService.deleteSessions();
  }

  private checkScreenSize(): void {
    // Always show sidebar on larger screens
    if (window.innerWidth > 768) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }
}