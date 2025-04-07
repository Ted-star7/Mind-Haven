import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

interface JournalEntry {
  id: string;
  mood: string;
  description: string;
  tags?: string;
  date: string;
}

interface MoodData {
  emoji: string;
  label: string;
  description: string;
  score: number;
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, BaseChartDirective],
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.css']
})
export class JournalComponent implements OnInit {
  selectedMood: string | null = null;
  selectedMoodScore: number | null = null;
  gratitudeEntry: string = '';
  tag: string = '';
  pastEntries: JournalEntry[] = [];

  isLoadingEntries: boolean = false;
  isSavingEntry: boolean = false;
  saveSuccess: boolean = false;
  saveError: string | null = null;
  loading: boolean = false;

  // Mood data with scores
  moods: MoodData[] = [
    { emoji: '😊', label: 'Happy', description: 'Feeling joyful and content', score: 3 },
    { emoji: '😐', label: 'Neutral', description: 'Feeling okay but not overly happy or sad', score: 2 },
    { emoji: '😢', label: 'Sad', description: 'Feeling down or emotionally low', score: 1 },
    { emoji: '🌟', label: 'Proud', description: 'Achieved something meaningful', score: 4 }
  ];

  // Chart data
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        min: 1,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            const mood = this.getMoodLabel(Number(value));
            return mood ? `${value} (${mood})` : value;
          }
        }
      }
    }
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true
  };

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

    this.servicesService.getRequest(`/api/mood-logger/logs/${userId}`, token).subscribe({
      next: (response) => {
        this.pastEntries = response || [];
        this.isLoadingEntries = false;
        this.loading = false;
        this.updateCharts();
      },
      error: (error) => {
        this.saveError = 'Failed to load past entries.';
        this.isLoadingEntries = false;
        this.loading = false;
        console.error('Error loading entries:', error);
      }
    });
  }

  updateCharts(): void {
    // Update line chart with weekly averages
    const weeklyAverages = this.getWeeklyMoodAverage();
    this.lineChartData = {
      labels: weeklyAverages.map(item => item.date),
      datasets: [{
        label: 'Weekly Mood Average',
        data: weeklyAverages.map(item => item.average),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };

    // Update pie chart with mood frequency
    const moodFrequency = this.getMoodFrequency();
    this.pieChartData = {
      labels: moodFrequency.map(item => item.mood),
      datasets: [{
        data: moodFrequency.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ]
      }]
    };
  }

  getWeeklyMoodAverage(): { date: string, average: number }[] {
    if (!this.pastEntries.length) return [];

    const weeklyAverages: { date: string, average: number }[] = [];
    const entriesByWeek: { [week: string]: number[] } = {};

    // Group entries by week
    this.pastEntries.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      const moodScore = this.moods.find(m => m.label === entry.mood)?.score || 0;

      if (!entriesByWeek[weekKey]) {
        entriesByWeek[weekKey] = [];
      }
      entriesByWeek[weekKey].push(moodScore);
    });

    // Calculate averages
    for (const week in entriesByWeek) {
      const sum = entriesByWeek[week].reduce((a, b) => a + b, 0);
      const average = sum / entriesByWeek[week].length;
      weeklyAverages.push({ date: week, average });
    }

    return weeklyAverages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  getMoodFrequency(): { mood: string, count: number }[] {
    const frequency: { [mood: string]: number } = {};

    this.moods.forEach(mood => {
      frequency[mood.label] = 0;
    });

    this.pastEntries.forEach(entry => {
      frequency[entry.mood]++;
    });

    return Object.keys(frequency).map(mood => ({
      mood,
      count: frequency[mood]
    }));
  }

  getMoodTagCorrelations(): { tag: string, averageMood: number }[] {
    const tagData: { [tag: string]: { sum: number, count: number } } = {};

    this.pastEntries.forEach(entry => {
      if (!entry.tags) return;

      const moodScore = this.moods.find(m => m.label === entry.mood)?.score || 0;
      const tags = entry.tags.split(',').map(t => t.trim());

      tags.forEach(tag => {
        if (!tagData[tag]) {
          tagData[tag] = { sum: 0, count: 0 };
        }
        tagData[tag].sum += moodScore;
        tagData[tag].count++;
      });
    });

    return Object.keys(tagData).map(tag => ({
      tag,
      averageMood: tagData[tag].sum / tagData[tag].count
    })).sort((a, b) => b.averageMood - a.averageMood);
  }

  public getMoodLabel(score: number): string {
    const moodMap: { [key: number]: string } = {
      1: 'Sad',
      2: 'Neutral',
      3: 'Happy',
      4: 'Proud'
    };
    return moodMap[Math.round(score)] || '';
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
      tag: this.tag
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
    this.selectedMoodScore = null;
    this.gratitudeEntry = '';
    this.tag = '';
  }

  selectMood(mood: string): void {
    const moodObj = this.moods.find(m => m.label === mood);
    if (moodObj) {
      this.selectedMood = mood;
      this.selectedMoodScore = moodObj.score;
    }
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

    this.servicesService.deleteRequest(`/api/mood-logger/logs/${entryId}`, token).subscribe({
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