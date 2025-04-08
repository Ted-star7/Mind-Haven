import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';
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
  loading: boolean = true;
  restoreAttempts: number = 0;
  maxRestoreAttempts: number = 3;
  streakStatus: 'active' | 'dying' | 'expired' = 'active';
  hoursSinceLastJournal: number = 0;
  userId: string | null = null;
  token: string | null = null;
  restoreInProgress: boolean = false;
  errorMessage: string | null = null;
  hasJournaledBefore: boolean = false;

  constructor(
    private servicesService: ServicesService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.userId = this.sessionService.getUserId();
    this.token = this.sessionService.gettoken();
    this.loadStreakData();
  }

  loadStreakData(): void {
    if (!this.userId || !this.token) {
      this.handleStreakError();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.servicesService.getRequest(`/api/streak/${this.userId}`, this.token)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.streak = response.data.streak || 0;
            this.restoreAttempts = response.data.resetStreakCount || 0;
            this.hoursSinceLastJournal = response.data.hoursSinceLastJournal || 0;
            this.hasJournaledBefore = response.data.hasJournaledBefore || false;
            this.updateStreakStatus();
          } else {
            this.errorMessage = response.message || 'Failed to load streak data';
            console.error('Error loading streak data:', response.message);
            this.handleStreakError();
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to connect to server';
          console.error('Error loading streak data:', error);
          this.handleStreakError();
          this.loading = false;
        }
      });
  }

  updateStreakStatus(): void {
    if (this.streak === 0) {
      this.streakStatus = 'expired';
    } else if (this.hoursSinceLastJournal >= 24) {
      this.streakStatus = 'expired';
    } else if (this.hoursSinceLastJournal >= 20) {
      this.streakStatus = 'dying';
    } else {
      this.streakStatus = 'active';
    }
  }

  restoreStreak(): void {
    if (this.restoreAttempts >= this.maxRestoreAttempts || !this.userId || !this.token || this.restoreInProgress) {
      return;
    }

    this.restoreInProgress = true;
    this.errorMessage = null;

    this.servicesService.getRequest(`/api/streak/restore/${this.userId}`, this.token)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // After successful restore, reload the streak data
            this.loadStreakData();
          } else {
            this.errorMessage = response.message || 'Failed to restore streak';
            console.error('Failed to restore streak:', response.message);
          }
          this.restoreInProgress = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to connect to server';
          console.error('Error restoring streak:', error);
          this.restoreInProgress = false;
        }
      });
  }

  handleStreakError(): void {
    this.streak = 0;
    this.restoreAttempts = 0;
    this.streakStatus = 'expired';
    this.hasJournaledBefore = false;
  }

  getStreakMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }

    if (!this.hasJournaledBefore) {
      return 'Start journaling today to begin your streak!';
    }

    switch (this.streakStatus) {
      case 'active':
        return `Keep it going! You're on a ${this.streak}-day streak.`;
      case 'dying':
        return `Your flame is fading! Journal soon to keep your ${this.streak}-day streak alive.`;
      case 'expired':
        if (this.restoreAttempts < this.maxRestoreAttempts) {
          const remainingAttempts = this.maxRestoreAttempts - this.restoreAttempts;
          return `Your streak expired! You can restore it ${remainingAttempts} more time(s).`;
        } else {
          return 'Your streak has ended. Start journaling to begin a new one!';
        }
      default:
        return 'Start journaling today to begin your streak!';
    }
  }

  getFlameIcon(): string {
    switch (this.streakStatus) {
      case 'active': return '🔥';
      case 'dying': return '🕯️';
      case 'expired': return '💀';
      default: return '🔥';
    }
  }
}