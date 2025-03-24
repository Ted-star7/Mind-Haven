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
  saveError: boolean = false;

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
    return mood ? mood.emoji : '❓'; // Returns the emoji if found, or a question mark if not
  }

  selectMood(mood: string): void {
    this.selectedMood = mood;
  }

  loadPastEntries(): void {
    const userId = this.sessionService.getid();
    if (!userId) return;

    this.loading = true;
    this.servicesService.getRequest(`/api/mood-logger/logs/${userId}`)
      .subscribe({
        next: (entries) => {
          this.pastEntries = entries || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading past entries:', error);
          this.loading = false;
        }
      });
  }

  saveJournalEntry(): void {
    const userId = this.sessionService.getid();
    if (!userId || !this.selectedMood) {
      this.saveError = true;
      setTimeout(() => this.saveError = false, 3000);
      return;
    }

    const entryData = {
      mood: this.selectedMood,
      description: this.gratitudeEntry,
      tags: this.tags
    };

    this.loading = true;
    this.servicesService.postRequest(`/api/mood-logger/new-log/${userId}`, entryData, this.sessionService.gettoken())
      .subscribe({
        next: (response) => {
          this.pastEntries.unshift(response); // Add new entry at the beginning
          this.resetForm();
          this.loading = false;
          this.saveSuccess = true;
          setTimeout(() => this.saveSuccess = false, 3000);
        },
        error: (error) => {
          console.error('Error saving journal entry:', error);
          this.loading = false;
          this.saveError = true;
          setTimeout(() => this.saveError = false, 3000);
        }
      });
  }

  deleteEntry(entryId: number): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.loading = true;
      this.servicesService.deleteRequest(`/api/mood-logger/logs/${entryId}`, this.sessionService.gettoken())
        .subscribe({
          next: () => {
            this.pastEntries = this.pastEntries.filter(entry => entry.id !== entryId);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting entry:', error);
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