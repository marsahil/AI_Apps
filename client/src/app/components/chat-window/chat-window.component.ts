/**
 * Chat Window Component
 * Provides a natural conversational interface to interact with the database
 */

import { Component, ViewChild, ElementRef, input, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResultsPanelComponent } from '../results-panel/results-panel.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  result?: any;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ResultsPanelComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="chat-window">
      <div class="chat-header">
        <h2>Database Chat Assistant</h2>
        <button class="btn-clear" (click)="clearChat()" title="Clear conversation">
          🗑️ Clear
        </button>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div *ngIf="messages.length === 0" class="welcome-message">
          <h3>Welcome! 👋</h3>
          <p>Ask me anything about your database. Examples:</p>
          <ul>
            <li>"Show me all trades"</li>
            <li>"Get pending orders"</li>
            <li>"Find trade TRADE001"</li>
            <li>"Show schema for HR owner"</li>
          </ul>
        </div>

        <div *ngFor="let msg of messages; let i = index" class="chat-message" [ngClass]="msg.type">
          <div class="message-avatar">
            {{ msg.type === 'user' ? '👤' : msg.type === 'error' ? '❌' : '🤖' }}
          </div>
          <div class="message-content">
            <div class="message-text">{{ msg.content }}</div>
            <div *ngIf="msg.result" class="message-result">
              <app-results-panel [result]="msg.result"></app-results-panel>
            </div>
            <small class="message-time">{{ msg.timestamp | date:'short' }}</small>
          </div>
        </div>

        <div *ngIf="isLoading" class="chat-message assistant">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <app-loading-spinner></app-loading-spinner>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <textarea
          #chatInput
          [(ngModel)]="userMessage"
          placeholder="Ask me about your database... (e.g., 'Show me all trades' or 'Find order by status PENDING')"
          (keydown.enter)="!$event.shiftKey && sendMessage()"
          class="chat-input"
          rows="3"
        ></textarea>
        <button
          (click)="sendMessage()"
          [disabled]="isLoading || !userMessage.trim()"
          class="btn-send"
        >
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-window {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 100px);
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom: 1px solid #ddd;
    }

    .chat-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .btn-clear {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: #f9f9f9;
    }

    .welcome-message {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .welcome-message h3 {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 18px;
    }

    .welcome-message p {
      margin: 0 0 15px 0;
      color: #888;
    }

    .welcome-message ul {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .welcome-message li {
      background: white;
      padding: 10px 15px;
      border-radius: 4px;
      color: #666;
      border-left: 3px solid #667eea;
    }

    .chat-message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-message.user {
      justify-content: flex-end;
    }

    .chat-message.user .message-content {
      background: #667eea;
      color: white;
    }

    .chat-message.assistant .message-content {
      background: white;
      color: #333;
      border: 1px solid #ddd;
    }

    .chat-message.error .message-content {
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }

    .message-avatar {
      font-size: 24px;
      min-width: 32px;
      text-align: center;
      padding-top: 2px;
    }

    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 8px;
    }

    .chat-message.user .message-content {
      max-width: 70%;
    }

    .message-text {
      word-wrap: break-word;
      line-height: 1.4;
      margin-bottom: 8px;
    }

    .message-result {
      margin-top: 12px;
      background: rgba(0, 0, 0, 0.05);
      padding: 12px;
      border-radius: 4px;
    }

    .message-time {
      font-size: 11px;
      opacity: 0.7;
      margin-top: 8px;
      display: block;
    }

    .chat-input-area {
      display: flex;
      gap: 10px;
      padding: 15px 20px;
      background: white;
      border-top: 1px solid #ddd;
    }

    .chat-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      resize: none;
      max-height: 100px;
    }

    .chat-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-send {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 100px;
    }

    .btn-send:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ChatWindowComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef<HTMLTextAreaElement>;

  messages: ChatMessage[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  private shouldScroll: boolean = false;

  constructor(private apiService: ApiService) {}

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) {
      return;
    }

    const userMsg = this.userMessage.trim();
    this.userMessage = '';

    // Add user message to chat
    this.addMessage({
      type: 'user',
      content: userMsg,
      timestamp: new Date()
    });

    this.isLoading = true;
    this.shouldScroll = true;

    // Parse the user message and determine the appropriate API call
    this.processNaturalLanguage(userMsg);
  }

  private processNaturalLanguage(query: string): void {
    const upperQuery = query.toUpperCase();

    // Detect intent from keywords
    if (
      upperQuery.includes('TRADE') ||
      upperQuery.includes('SHOW') ||
      upperQuery.includes('GET') ||
      upperQuery.includes('FIND') ||
      upperQuery.includes('LIST') ||
      upperQuery.includes('SELECT')
    ) {
      // Handle trade queries
      if (upperQuery.includes('TRADE ID') || upperQuery.includes('TRADE_ID')) {
        const match = query.match(/TRADE\d+/i);
        if (match) {
          this.getTradeById(match[0]);
        } else {
          this.listAllTrades();
        }
      } else if (upperQuery.includes('TRADE')) {
        this.listAllTrades();
      }
      // Handle order queries
      else if (upperQuery.includes('ORDER') || upperQuery.includes('PENDING') || upperQuery.includes('COMPLETED')) {
        const status = this.extractStatus(query);
        if (status) {
          this.searchOrders(status);
        } else {
          this.searchOrders('PENDING');
        }
      }
      // Handle schema queries
      else if (upperQuery.includes('SCHEMA') || upperQuery.includes('COLUMN') || upperQuery.includes('TABLE')) {
        const owner = this.extractOwner(query) || 'SCOTT';
        this.getSchemaInfo(owner);
      }
      // Generic SQL query
      else {
        // Try to detect if it looks like a SQL query
        if (
          upperQuery.includes('FROM') ||
          upperQuery.includes('WHERE') ||
          upperQuery.includes('SELECT')
        ) {
          this.executeSQLQuery(query);
        } else {
          this.addMessage({
            type: 'assistant',
            content:
              "I'm not sure what you're asking. Try:\n" +
              "• 'Show all trades'\n" +
              "• 'Get pending orders'\n" +
              "• 'Find trade TRADE001'\n" +
              "• 'Show schema for HR owner'\n" +
              "• Or provide a direct SQL SELECT query",
            timestamp: new Date()
          });
          this.isLoading = false;
        }
      }
    } else {
      this.addMessage({
        type: 'assistant',
        content:
          "I can help with database queries! Try:\n" +
          "• 'Show all trades'\n" +
          "• 'Get pending orders'\n" +
          "• 'Find trade TRADE001'\n" +
          "• 'Show schema for HR owner'\n" +
          "• Or ask me to execute a SELECT query",
        timestamp: new Date()
      });
      this.isLoading = false;
    }
  }

  private extractOwner(query: string): string | null {
    const match = query.match(/(?:owner|schema)\s+(\w+)/i);
    return match ? match[1].toUpperCase() : null;
  }

  private extractStatus(query: string): string | null {
    const statuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'SETTLED'];
    for (const status of statuses) {
      if (query.toUpperCase().includes(status)) {
        return status;
      }
    }
    return null;
  }

  private listAllTrades(): void {
    this.apiService.listTrades(50).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.addMessage({
            type: 'assistant',
            content: `Found ${response.data?.rowCount || 0} trades`,
            timestamp: new Date(),
            result: response.data
          });
        } else {
          this.handleError(response);
        }
        this.shouldScroll = true;
      },
      (error: any) => {
        this.isLoading = false;
        this.handleError(error);
        this.shouldScroll = true;
      }
    );
  }

  private getTradeById(tradeId: string): void {
    this.apiService.getTradeById(tradeId).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          const rowCount = response.data?.rowCount || 0;
          this.addMessage({
            type: 'assistant',
            content: rowCount > 0 ? `Found trade ${tradeId}` : `Trade ${tradeId} not found`,
            timestamp: new Date(),
            result: rowCount > 0 ? response.data : undefined
          });
        } else {
          this.handleError(response);
        }
        this.shouldScroll = true;
      },
      (error: any) => {
        this.isLoading = false;
        this.handleError(error);
        this.shouldScroll = true;
      }
    );
  }

  private searchOrders(status: string): void {
    this.apiService.searchOrders(status, 50).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.addMessage({
            type: 'assistant',
            content: `Found ${response.data?.rowCount || 0} orders with status: ${status}`,
            timestamp: new Date(),
            result: response.data
          });
        } else {
          this.handleError(response);
        }
        this.shouldScroll = true;
      },
      (error: any) => {
        this.isLoading = false;
        this.handleError(error);
        this.shouldScroll = true;
      }
    );
  }

  private getSchemaInfo(owner: string): void {
    this.apiService.getSchemaInfo(owner).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.addMessage({
            type: 'assistant',
            content: `Schema information for owner: ${owner}`,
            timestamp: new Date(),
            result: response.data
          });
        } else {
          this.handleError(response);
        }
        this.shouldScroll = true;
      },
      (error: any) => {
        this.isLoading = false;
        this.handleError(error);
        this.shouldScroll = true;
      }
    );
  }

  private executeSQLQuery(sql: string): void {
    this.apiService.executeQuery({ sql, binds: {}, maxRows: 500 }).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.addMessage({
            type: 'assistant',
            content: `Query executed: ${response.data?.rowCount || 0} rows returned`,
            timestamp: new Date(),
            result: response.data
          });
        } else {
          this.handleError(response);
        }
        this.shouldScroll = true;
      },
      (error: any) => {
        this.isLoading = false;
        this.handleError(error);
        this.shouldScroll = true;
      }
    );
  }

  private handleError(error: any): void {
    const errorMessage =
      error?.details ||
      error?.error ||
      error?.message ||
      'An error occurred while processing your request';

    this.addMessage({
      type: 'error',
      content: errorMessage,
      timestamp: new Date()
    });
  }

  private addMessage(msg: Partial<ChatMessage>): void {
    const fullMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      ...msg
    };
    this.messages.push(fullMsg);
    this.shouldScroll = true;
  }

  clearChat(): void {
    this.messages = [];
    this.userMessage = '';
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }
}
