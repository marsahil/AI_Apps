/**
 * Error Message Component
 * Displays error messages with helpful information
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          <h4>{{ error?.error || 'Error' }}</h4>
          <p *ngIf="error?.details">{{ error.details }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      padding: 15px;
      margin-top: 20px;
    }

    .error-content {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .error-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .error-text h4 {
      margin: 0 0 5px 0;
      color: #c33;
    }

    .error-text p {
      margin: 0;
      color: #666;
      font-size: 13px;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() error: any;
}
