import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Import CommonModule
import { RouterModule } from '@angular/router';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add CommonModule
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
    document.body.style.overflow = this.isSidebarOpen ? 'hidden' : '';
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
    if (window.innerWidth > 768) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }
}