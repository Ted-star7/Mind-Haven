import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  filteredArticles: any[] = [];
  featuredArticles: any[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  totalArticles: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  recentArticles: any[] = [];
  searchPerformed: boolean = false;

  constructor(private servicesService: ServicesService) { }

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.servicesService.getRequest('/api/open/GNews-mental-health/articles')
      .subscribe({
        next: (response) => {
          this.articles = response.articles.map((article: any, index: number) => ({
            ...article,
            id: index,
            category: this.getRandomCategory() // Add random category for demo
          }));
          this.filteredArticles = [...this.articles];
          this.totalArticles = response.totalArticles;
          this.featuredArticles = this.articles.slice(0, 3);
          this.recentArticles = this.articles.slice(0, 5);
          this.loading = false;
          this.searchPerformed = false;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
          this.loading = false;
        }
      });
  }

  searchArticles(): void {
    if (!this.searchQuery.trim()) {
      this.filteredArticles = [...this.articles];
      this.searchPerformed = false;
      return;
    }

    this.loading = true;
    this.searchPerformed = true;

    this.servicesService.getRequest(`/api/open/GNews-mental-health/articles/filter?keywords=${encodeURIComponent(this.searchQuery)}`)
      .subscribe({
        next: (response) => {
          this.filteredArticles = response.articles || [];
          this.totalArticles = response.totalArticles || 0;
          this.currentPage = 1; // Reset to first page on new search
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching articles:', error);
          this.filteredArticles = [];
          this.loading = false;
        }
      });
  }

  openArticle(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('Article URL is missing');
     
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalArticles / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Helper function to generate random categories (for demo purposes)
  private getRandomCategory(): string {
    const categories = ['Mental Health', 'Wellness', 'Psychology', 'Self-Care', 'Research'];
    return categories[Math.floor(Math.random() * categories.length)];
  }
}