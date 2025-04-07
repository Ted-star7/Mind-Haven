import { Component } from '@angular/core';
import { ServicesService } from '../services/consume.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent {
  userMessage: string = '';
  messages: { sender: string; text: string; isUser: boolean }[] = [];
  isLoading: boolean = false;
  sessionId: string = this.generateSessionId();
  userId: string | null = null;

  constructor(
    private servicesService: ServicesService,
    private sessionService: SessionService
  ) {
    // Initialize with user ID if logged in
    this.userId = this.sessionService.getUserId();

    // Add personalized welcome message
    const welcomeMessage = this.userId
      ? `Welcome back! How can I support your mental wellness today?`
      : "Hello! I'm MindHaven's mental health assistant. How can I help you today?";

    this.addBotMessage(welcomeMessage);
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;

    // Add user message to chat
    this.addUserMessage(this.userMessage);
    const currentMessage = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Prepare request payload with user context
    const payload = {
      queryInput: {
        text: {
          text: currentMessage,
          languageCode: 'en'
        }
      },
      sessionId: this.sessionId,
      userId: this.userId, // Include user ID if available
      isLoggedIn: this.sessionService.isLoggedIn()
    };

    // Call Dialogflow webhook
    this.servicesService.postRequest('/api/open/dialogflow/webhook', payload, this.sessionService.gettoken())
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.queryResult?.fulfillmentText) {
            this.addBotMessage(response.queryResult.fulfillmentText);

            // Check for any session updates from backend
            if (response.token) {
              this.sessionService.saveToken(response.token);
            }
          } else {
            this.addBotMessage("I'm not sure how to respond to that. Can you try rephrasing?");
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.addBotMessage("Sorry, I'm having trouble connecting right now. Please try again later.");
          console.error('Dialogflow error:', error);

          // If unauthorized, prompt to login
          if (error.status === 401) {
            this.addBotMessage("It seems your session expired. Please refresh the page or log in again.");
          }
        }
      });
  }

  private addUserMessage(text: string) {
    this.messages.push({
      sender: this.userId ? 'You' : 'Guest',
      text,
      isUser: true
    });
  }

  private addBotMessage(text: string) {
    this.messages.push({
      sender: 'MindHaven Bot',
      text,
      isUser: false
    });
  }

  private generateSessionId(): string {
    // Combine random string with user ID if available for better tracking
    const userPrefix = this.userId ? this.userId.slice(-4) : 'anon';
    return `${userPrefix}-${Math.random().toString(36).substring(2, 11)}`;
  }
}