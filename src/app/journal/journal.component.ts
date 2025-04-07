import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface JournalEntry {
  id: string;
  mood: string;
  description: string;
  tags?: string;
  date: string;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {
  selectedMood: string | null = null;
  gratitudeEntry: string = '';
  tags: string = '';
  pastEntries: JournalEntry[] = [];

  isLoadingEntries: boolean = false;
  isSavingEntry: boolean = false;
  saveSuccess: boolean = false;
  saveError: string | null = null;
  loading: boolean = false;

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

  loadPastEntries(): void {
    const userId = this.sessionService.getUserId();
    const token = this.sessionService.gettoken();

    if (!userId || !token) {
      this.saveError = 'User not found. Please log in again.';
      return;
    }

    this.isLoadingEntries = true;
    this.loading = true;

    this.servicesService.getMethod(`/api/mood-logger/get-all/${userId}`, token).subscribe({
      next: (response) => {
        this.pastEntries = response || [];
        this.isLoadingEntries = false;
        this.loading = false;
      },
      error: (error) => {
        this.saveError = 'Failed to load past entries.';
        this.isLoadingEntries = false;
        this.loading = false;
        console.error('Error loading entries:', error);
      }
    });
  }

  saveJournalEntry(): void {
    if (!this.selectedMood) {
      this.saveError = 'Please select a mood';
      return;
    }

    const userId = this.sessionService.getUserId();
    const token = this.sessionService.gettoken();

    if (!userId || !token) {
      this.saveError = 'User not found. Please log in again.';
      return;
    }

    const payload = {
      mood: this.selectedMood,
      description: this.gratitudeEntry,
      tag: this.tags
    };

    this.isSavingEntry = true;

    this.servicesService.postRequest(`/api/mood-logger/new-log/${userId}`, payload, token).subscribe({
      next: (response) => {
        this.isSavingEntry = false;
        this.saveSuccess = true;
        this.saveError = null;
        this.resetForm();
        this.loadPastEntries();
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (error) => {
        this.isSavingEntry = false;
        this.saveError = 'Failed to save entry. Please try again.';
        console.error('Error saving entry:', error);
      }
    });
  }

  resetForm(): void {
    this.selectedMood = null;
    this.gratitudeEntry = '';
    this.tags = '';
  }

  selectMood(mood: string): void {
    this.selectedMood = mood;
    this.saveError = null;
  }

  getMoodEmoji(mood: string): string {
    const moodObj = this.moods.find(m => m.label === mood);
    return moodObj ? moodObj.emoji : '';
  }

  formatDate(date: string): string {
    try {
      const d = new Date(date);
      return isNaN(d.getTime()) ? date : d.toLocaleDateString();
    } catch {
      return date;
    }
  }

  deleteEntry(entryId: string): void {
    const userId = this.sessionService.getUserId();
    const token = this.sessionService.gettoken();

    if (!userId || !token) {
      this.saveError = 'User not found. Please log in again.';
      return;
    }

    this.loading = true;

    this.servicesService.deleteRequest(`/api/mood-logger/delete/${userId}/${entryId}`, token).subscribe({
      next: () => {
        this.loadPastEntries();
        this.loading = false;
      },
      error: (error) => {
        this.saveError = 'Failed to delete entry. Please try again.';
        this.loading = false;
        console.error('Error deleting entry:', error);
      }
    });
  }
}