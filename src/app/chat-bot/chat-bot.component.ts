import { Component, AfterViewInit } from '@angular/core';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements AfterViewInit {
  userId: string | null = null;

  constructor(private sessionService: SessionService) {
    this.userId = this.sessionService.getUserId();
  }

  ngAfterViewInit() {
    this.loadDialogflowScript();
  }

  private loadDialogflowScript() {
    // Check if script is already loaded
    if (document.querySelector('script[src*="dialogflow-console"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    script.onload = () => this.initializeChatWidget();
    document.body.appendChild(script);
  }

  private initializeChatWidget() {
    // Create the chat widget element
    const dfMessenger = document.createElement('df-messenger');

    // Set attributes
    dfMessenger.setAttribute('intent', 'WELCOME');
    dfMessenger.setAttribute('chat-title', 'MindHaven Bot');
    dfMessenger.setAttribute('agent-id', '1f0c2cc9-c9d7-49d4-8ce9-004e113f4ed2');
    dfMessenger.setAttribute('language-code', 'en');

    // Add user context if available
    if (this.userId) {
      dfMessenger.setAttribute('user-id', this.userId);
    }

    // Custom styling attributes
    dfMessenger.setAttribute('chat-icon', 'assets/images/chat-icon.png');
    dfMessenger.setAttribute('expand', 'true');

    // Append to your container
    const container = document.getElementById('df-messenger-container');
    if (container) {
      container.appendChild(dfMessenger);
    }
  }
}