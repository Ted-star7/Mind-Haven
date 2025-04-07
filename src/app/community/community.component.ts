import { HttpClientModule } from '@angular/common/http'; 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicesService } from '../services/consume.service';
import { SessionService } from '../services/session.service';
import { finalize } from 'rxjs/operators';

interface CommunityPost {
  id: number;
  userId: number;
  name: string;
  thoughts: string;
  date: string;
}

interface NewPostRequest {
  thoughts: string;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  posts: CommunityPost[] = [];
  newPostText: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private servicesService: ServicesService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.loadCommunityPosts();
  }

  loadCommunityPosts(): void {
    
    const token = this.sessionService.gettoken();

    if (!token) {
      this.errorMessage = 'You need to be logged in to view community posts';
      setTimeout(() => this.errorMessage = null, 5000);
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.servicesService.getRequest('/api/forum/chats', token)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: CommunityPost[]) => {
          this.posts = response || [];
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to load community posts. Please try again.';
          console.error('Error loading posts:', error);
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }
  submitPost(): void {
    const token = this.sessionService.gettoken();
    if (!this.newPostText.trim()) {
      this.errorMessage = 'Please enter your thoughts before submitting.';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    const userId = this.sessionService.getUserId();
    if (!userId) {
      this.errorMessage = 'You need to be logged in to post.';
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }

    const postData: NewPostRequest = {
      thoughts: this.newPostText.trim()
    };

    this.isSubmitting = true;
    this.servicesService.postRequest(`/api/forum/new-chat/${userId}`,postData,token)
    .pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (newPost: CommunityPost) => {
        this.posts.unshift(newPost);
        this.newPostText = '';
        this.successMessage = 'Your post has been shared with the community!';
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Failed to submit your post. Please try again.';
        console.error('Error submitting post:', error);
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
}