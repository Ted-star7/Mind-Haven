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
    this.checkStreakStatus();
  }

  loadStreakData(): void {
    // Get streak from session service
    this.streak = Number(this.sessionService.getStreak()) || 0;

    // In a real app, you would fetch this from your API
    // Example:
    // this.servicesService.getRequest('/api/user/streak')
    //   .subscribe({
    //     next: (data) => {
    //       this.streak = data.streak;
    //       this.lastJournalDate = new Date(data.lastJournalDate);
    //       this.loading = false;
    //       this.checkStreakStatus();
    //     },
    //     error: (error) => {
    //       console.error('Error loading streak data:', error);
    //       this.loading = false;
    //     }
    //   });
  }

  checkStreakStatus(): void {
    // Check if streak is about to expire (within last 24 hours)
    if (this.streak > 0) {
      const now = new Date();
      const hoursSinceLastJournal = 24; // This would normally be calculated from lastJournalDate

      if (hoursSinceLastJournal >= 20) { // Warning at 20 hours
        this.streakWarning = true;

        if (hoursSinceLastJournal >= 24) {
          this.resetStreak();
        }
      }
    }
  }

  resetStreak(): void {
    this.streak = 0;
    this.streakWarning = false;
    // In a real app, you would update this on the server
    // Example:
    // this.servicesService.postRequest('/api/user/reset-streak', {})
    //   .subscribe({
    //     next: () => console.log('Streak reset'),
    //     error: (error) => console.error('Error resetting streak:', error)
    //   });
  }

  getStreakMessage(): string {
    if (this.streak === 0) {
      return 'Start journaling today to begin your streak!';
    } else if (this.streakWarning) {
      return `Your streak will end soon! Journal within the next ${24 - 20} hours to keep it alive.`;
    } else {
      return `Keep it going! You're on a ${this.streak}-day streak.`;
    }
  }
}