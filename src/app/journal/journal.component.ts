import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.css'
})
export class JournalComponent implements OnInit {
  selectedMood: string | null = null;
  gratitudeEntry: string = '';
  tags: string = '';
  pastEntries: any[] = [];
  loading: boolean = false;
  saveSuccess: boolean = false;
  saveError: string | null = null;
  isLoadingEntries: boolean = false;
  isSavingEntry: boolean = false;

  moods = [
    { emoji: '😊', label: 'Happy', description: 'Feeling joyful and content' },
    { emoji: '😐', label: 'Neutral', description: 'Feeling okay but not overly happy or sad' },
    { emoji: '😢', label: 'Sad', description: 'Feeling down or emotionally low' },
    { emoji: '🌟', label: 'Proud', description: 'Achieved something meaningful' }
  ];

  constructor(
    private servicesService: ServicesService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.loadPastEntries();
  }

  getMoodEmoji(moodLabel: string): string {
    const mood = this.moods.find(m => m.label === moodLabel);
    return mood ? mood.emoji : '❓';
  }

  selectMood(mood: string): void {
    this.selectedMood = mood;
  }

  loadPastEntries(): void {
    const userId = this.sessionService.getid();
    const token = this.sessionService.gettoken();

    if (!userId) {
      this.saveError = 'User ID not found. Please log in again.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    if (!token) {
      this.saveError = 'Authentication token not found. Please log in again.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    this.isLoadingEntries = true;
    this.servicesService.getMethod(`/api/mood-logger/logs/${userId}`, token)
      .subscribe({
        next: (entries) => {
          this.pastEntries = entries || [];
          this.isLoadingEntries = false;
        },
        error: (error) => {
          console.error('Error loading past entries:', error);
          this.saveError = 'Failed to load entries. Please try again.';
          setTimeout(() => this.saveError = null, 3000);
          this.isLoadingEntries = false;
        }
      });
  }

  saveJournalEntry(): void {
    const userId = this.sessionService.getid();
    const token = this.sessionService.gettoken();

    if (!userId) {
      this.saveError = 'User ID not found. Please log in again.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    if (!this.selectedMood) {
      this.saveError = 'Please select a mood.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    if (!token) {
      this.saveError = 'Authentication token not found. Please log in again.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    const entryData = {
      mood: this.selectedMood,
      description: this.gratitudeEntry,
      tag: this.tags // Note: API expects 'tag' not 'tags'
    };

    this.isSavingEntry = true;
    this.servicesService.postRequest(
      `/api/mood-logger/new-log/${userId}`,
      entryData,
      token
    ).subscribe({
      next: (response) => {
        this.pastEntries.unshift(response);
        this.resetForm();
        this.isSavingEntry = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        console.error('Error saving journal entry:', error);
        this.saveError = error.error?.message || 'Failed to save entry. Please try again.';
        setTimeout(() => this.saveError = null, 3000);
        this.isSavingEntry = false;
      }
    });
  }

  deleteEntry(entryId: number): void {
    const token = this.sessionService.gettoken();
    if (!token) {
      this.saveError = 'Authentication token not found. Please log in again.';
      setTimeout(() => this.saveError = null, 3000);
      return;
    }

    if (confirm('Are you sure you want to delete this entry?')) {
      this.loading = true;
      this.servicesService.deleteRequest(`/api/mood-logger/logs/${entryId}`, token)
        .subscribe({
          next: () => {
            this.pastEntries = this.pastEntries.filter(entry => entry.id !== entryId);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting entry:', error);
            this.saveError = 'Failed to delete entry. Please try again.';
            setTimeout(() => this.saveError = null, 3000);
            this.loading = false;
          }
        });
    }
  }

  resetForm(): void {
    this.selectedMood = null;
    this.gratitudeEntry = '';
    this.tags = '';
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}