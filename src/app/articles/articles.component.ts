import { Component, OnInit } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
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
  expandedArticleId: number | null = null; // Track which article is expanded
  placeholderImg: any;
  recentArticles: any[] = [];


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
            isExpanded: false
          }));
          this.filteredArticles = [...this.articles];
          this.totalArticles = response.totalArticles;
          this.featuredArticles = this.articles.slice(0, 3);
          this.recentArticles = this.articles.slice(0, 5); // Store the 5 most recent articles
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading articles:', error);
          this.loading = false;
        }
      });
  }

  toggleArticleExpansion(articleId: number): void {
    if (this.expandedArticleId === articleId) {
      this.expandedArticleId = null;
    } else {
      this.expandedArticleId = articleId;
    }
  }

  isArticleExpanded(articleId: number): boolean {
    return this.expandedArticleId === articleId;
  }

  searchArticles(): void {
    if (!this.searchQuery.trim()) {
      this.filteredArticles = [...this.articles];
      return;
    }

    this.loading = true;
    this.servicesService.getRequest(`/api/open/GNews-mental-health/articles/filter?keywords=${encodeURIComponent(this.searchQuery)}`)
      .subscribe({
        next: (response) => {
          this.filteredArticles = response.articles || [];
          this.totalArticles = response.totalArticles || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching articles:', error);
          this.loading = false;
        }
      });
  }

  openArticle(url: string): void {
    window.open(url, '_blank');
  }

  get paginatedArticles(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredArticles.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.totalArticles / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}