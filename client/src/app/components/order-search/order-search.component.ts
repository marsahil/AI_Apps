/**
 * Order Search Component
 * Allows users to search for orders by status
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResultsPanelComponent } from '../results-panel/results-panel.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../error-message/error-message.component';

@Component({
  selector: 'app-order-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ResultsPanelComponent, LoadingSpinnerComponent, ErrorMessageComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Order Search</h2>
        <p class="subtitle">Search orders by status</p>
      </div>

      <form (ngSubmit)="searchOrders()" class="form-content">
        <div class="form-row">
          <div class="form-group">
            <label for="status">Order Status:</label>
            <select
              id="status"
              [(ngModel)]="status"
              name="status"
              class="form-control"
              required
            >
              <option value="">-- Select Status --</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="FAILED">FAILED</option>
            </select>
            <small class="help-text">Select an order status</small>
          </div>

          <div class="form-group">
            <label for="limit">Limit:</label>
            <input
              id="limit"
              type="number"
              [(ngModel)]="limit"
              name="limit"
              min="1"
              max="500"
              class="form-control"
              placeholder="100"
            />
            <small class="help-text">Maximum orders to return (max: 500)</small>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="isLoading || !status">
          Search Orders
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
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
      font-size: 14px;
    }

    .form-control:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
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
export class OrderSearchComponent {
  status: string = '';
  limit: number = 100;
  isLoading: boolean = false;
  result: any = null;
  error: any = null;

  constructor(private apiService: ApiService) {}

  searchOrders(): void {
    if (!this.status) {
      this.error = { error: 'Order status is required' };
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.result = null;

    this.apiService.searchOrders(this.status, this.limit).subscribe(
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
  }
}
