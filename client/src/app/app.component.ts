/**
 * Main Application Component
 * Root component that displays all forms and manages the overall layout
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { QueryFormComponent } from './components/query-form/query-form.component';
import { SchemaLookupComponent } from './components/schema-lookup/schema-lookup.component';
import { TradeLookupComponent } from './components/trade-lookup/trade-lookup.component';
import { OrderSearchComponent } from './components/order-search/order-search.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    QueryFormComponent,
    SchemaLookupComponent,
    TradeLookupComponent,
    OrderSearchComponent,
    ChatWindowComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>Oracle Database MCP Agent</h1>
          <p class="subtitle">Enterprise Database Query Interface</p>
        </div>
        <div class="health-status" [class.connected]="isConnected">
          <span class="status-indicator" [class.healthy]="isConnected"></span>
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </div>
      </header>

      <main class="app-main">
        <div class="container">
          <nav class="tabs">
            <button
              *ngFor="let tab of tabs"
              [class.active]="activeTab === tab"
              (click)="activeTab = tab"
              class="tab-button"
            >
              {{ tab }}
            </button>
          </nav>

          <div class="tab-content">
            <app-chat-window *ngIf="activeTab === 'Chat'"></app-chat-window>
            <app-query-form *ngIf="activeTab === 'Query'"></app-query-form>
            <app-schema-lookup *ngIf="activeTab === 'Schema'"></app-schema-lookup>
            <app-trade-lookup *ngIf="activeTab === 'Trade'"></app-trade-lookup>
            <app-order-search *ngIf="activeTab === 'Orders'"></app-order-search>
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <p>&copy; 2026 Oracle Database MCP Agent. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .app-header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 30px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-content h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }

    .header-content .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }

    .health-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ff4444;
      display: inline-block;
    }

    .status-indicator.healthy {
      background: #44ff44;
      box-shadow: 0 0 10px #44ff44;
    }

    .app-main {
      flex: 1;
      padding: 30px 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      background: white;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      flex-wrap: wrap;
    }

    .tab-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: #666;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .tab-button:hover {
      background: #f0f0f0;
    }

    .tab-button.active {
      background: #0066cc;
      color: white;
    }

    .tab-content {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .app-footer {
      background: #333;
      color: #999;
      text-align: center;
      padding: 20px;
      font-size: 13px;
      border-top: 1px solid #555;
    }

    @media (max-width: 768px) {
      .app-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }

      .header-content h1 {
        font-size: 22px;
      }

      .tabs {
        justify-content: flex-start;
        overflow-x: auto;
      }

      .tab-button {
        padding: 8px 15px;
        font-size: 13px;
      }
    }
  `],
  providers: [ApiService]
})
export class AppComponent implements OnInit {
  activeTab: string = 'Chat';
  tabs: string[] = ['Chat', 'Query', 'Schema', 'Trade', 'Orders'];
  isConnected: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.checkHealth();
    // Check health every 30 seconds
    setInterval(() => this.checkHealth(), 30000);
  }

  private checkHealth(): void {
    this.apiService.getHealth().subscribe(
      (response) => {
        this.isConnected = response.mcpConnected || false;
      },
      (error) => {
        this.isConnected = false;
      }
    );
  }
}
