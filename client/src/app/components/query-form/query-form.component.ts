/**
 * Query Form Component
 * Allows users to execute custom read-only SQL queries
 */

import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResultsPanelComponent } from '../results-panel/results-panel.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-query-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ResultsPanelComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Execute Query</h2>
        <p class="subtitle">Execute read-only SELECT or WITH queries</p>
      </div>

      <form (ngSubmit)="executeQuery()" class="form-content">
        <div class="form-group">
          <label for="sql">SQL Query:</label>
          <textarea
            id="sql"
            [(ngModel)]="sql"
            name="sql"
            placeholder="SELECT * FROM your_table WHERE condition = :bind_var"
            rows="6"
            class="form-control textarea"
            required
          ></textarea>
          <small class="help-text">Only SELECT and WITH statements are allowed. Use :variable_name for bind variables.</small>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="binds">Bind Variables (JSON):</label>
            <textarea
              id="binds"
              [(ngModel)]="bindsJson"
              name="binds"
              placeholder='{"bind_var": "value", "id": 123}'
              rows="3"
              class="form-control textarea"
            ></textarea>
            <small class="help-text">Optional JSON object for bind variables</small>
          </div>

          <div class="form-group">
            <label for="maxRows">Max Rows:</label>
            <input
              id="maxRows"
              type="number"
              [(ngModel)]="maxRows"
              name="maxRows"
              min="1"
              max="500"
              class="form-control"
              placeholder="500"
            />
            <small class="help-text">Maximum rows to return (max: 500)</small>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="isLoading || !sql.trim()">
          Execute Query
        </button>
      </form>

      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
      <app-error-message *ngIf="error" [error]="error"></app-error-message>
      <app-results-panel *ngIf="result && !isLoading" [result]="result"></app-results-panel>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }

    .card-header {
      margin-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 15px;
    }

    .card-header h2 {
      margin: 0 0 5px 0;
      color: #333;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    label {
      font-weight: 600;
      margin-bottom: 5px;
      color: #333;
    }

    .form-control {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
    }

    .form-control:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .textarea {
      resize: vertical;
      min-height: 60px;
    }

    .help-text {
      font-size: 12px;
      color: #999;
      margin-top: 3px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #0066cc;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0052a3;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class QueryFormComponent {
  sql: string = '';
  bindsJson: string = '';
  maxRows: number = 500;
  isLoading: boolean = false;
  result: any = null;
  error: any = null;

  constructor(private apiService: ApiService) {}

  executeQuery(): void {
    if (!this.sql.trim()) {
      this.error = { error: 'SQL query is required' };
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.result = null;

    try {
      const binds = this.bindsJson.trim() ? JSON.parse(this.bindsJson) : {};

      this.apiService.executeQuery({
        sql: this.sql,
        binds: binds,
        maxRows: this.maxRows
      }).subscribe(
        (response) => {
          this.isLoading = false;
          if (response.success) {
            this.result = response.data;
          } else {
            this.error = response;
          }
        },
        (error) => {
          this.isLoading = false;
          this.error = error;
        }
      );
    } catch (parseError) {
      this.isLoading = false;
      this.error = {
        error: 'Invalid JSON in bind variables',
        details: parseError instanceof Error ? parseError.message : 'Parse error'
      };
    }
  }
}
