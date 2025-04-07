import { Component, OnInit } from '@angular/core';
import { SessionService } from '../services/session.service';
import { ServicesService } from '../services/consume.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  streak: number = 0;
  lastJournalDate: Date | null = null;
  streakWarning: boolean = false;
  loading: boolean = true;

  constructor(
    private sessionService: SessionService,
    private servicesService: ServicesService
  ) { }

  ngOnInit(): void {
    this.loadStreakData();
  }
  
  loadStreakData(): void {
    // First try to get from session
    const streakFromSession = this.sessionService.getStreak();

    if (streakFromSession) {
      this.streak = parseInt(streakFromSession, 10);
      this.loading = false;
      this.checkStreakStatus();
    } else {
      // If not in session, try to fetch from API
      const userId = this.sessionService.getUserId();
      const token = this.sessionService.gettoken();

      if (userId && token) {
        this.servicesService.getRequest(`/api/user/streak/${userId}`, token)
          .subscribe({
            next: (response: any) => {
              this.streak = response.streak || 0;
              this.sessionService.saveStreak(this.streak);
              this.loading = false;
              this.checkStreakStatus();
            },
            error: (error) => {
              console.error('Error loading streak data:', error);
              this.streak = 0;
              this.loading = false;
            }
          });
      } else {
        this.streak = 0;
        this.loading = false;
      }
    }
  }

  checkStreakStatus(): void {
    if (this.streak > 0) {
      const now = new Date();
      const hoursSinceLastJournal = 24; // This should be calculated from lastJournalDate

      // Show warning if approaching streak break time
      this.streakWarning = hoursSinceLastJournal >= 20;

      // Reset if streak is broken
      if (hoursSinceLastJournal >= 24) {
        this.resetStreak();
      }
    }
  }

  resetStreak(): void {
    this.streak = 0;
    this.streakWarning = false;
    this.sessionService.saveStreak(0);

    // Optional: Update server about streak reset
    const userId = this.sessionService.getUserId();
    const token = this.sessionService.gettoken();

    if (userId && token) {
      this.servicesService.postRequest(
        `/api/user/reset-streak/${userId}`,
        {},
        token
      ).subscribe({
        error: (error) => console.error('Failed to update streak on server:', error)
      });
    }
  }

  getStreakMessage(): string {
    if (this.streak === 0) {
      return 'Start journaling today to begin your streak!';
    } else if (this.streakWarning) {
      return 'Your streak will end soon! Journal today to keep it alive.';
    } else {
      return `Keep it going! You're on a ${this.streak}-day streak.`;
    }
  }
}