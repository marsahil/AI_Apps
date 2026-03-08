/**
 * Results Panel Component
 * Displays formatted JSON results from API responses in table format
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-panel">
      <div class="results-header">
        <h3>Results ({{ result?.data?.rowCount || 0 }} rows)</h3>
        <button class="btn-copy" (click)="copyToClipboard()" title="Copy results">
          📋 Copy
        </button>
      </div>
      
      <!-- Table View for structured data -->
      <div *ngIf="isTableData()" class="table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th *ngFor="let column of result.data.columns">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of result.data.rows">
              <td *ngFor="let column of result.data.columns">
                {{ formatCellValue(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- JSON View for other data -->
      <pre *ngIf="!isTableData()" class="results-content">{{ formatResults() }}</pre>
    </div>
  `,
  styles: [`
    .results-panel {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 15px;
      margin-top: 20px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }

    .results-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-copy {
      padding: 5px 10px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .btn-copy:hover {
      background: #f0f0f0;
      border-color: #999;
    }

    .table-container {
      overflow-x: auto;
      background: white;
      border-radius: 3px;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
    }

    .results-table thead {
      background: #f0f0f0;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #ddd;
    }

    .results-table th {
      padding: 12px;
      text-align: left;
      white-space: nowrap;
    }

    .results-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #eee;
    }

    .results-table tbody tr:hover {
      background: #fafafa;
    }

    .results-table tbody tr:nth-child(even) {
      background: #fafafa;
    }

    .results-content {
      background: white;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      max-height: 400px;
      overflow-y: auto;
      margin: 0;
    }
  `]
})
export class ResultsPanelComponent {
  @Input() result: any;

  isTableData(): boolean {
    return this.result?.data?.columns && 
           this.result?.data?.rows && 
           Array.isArray(this.result.data.columns) &&
           Array.isArray(this.result.data.rows) &&
           this.result.data.rows.length > 0;
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  formatResults(): string {
    return JSON.stringify(this.result, null, 2);
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.formatResults()).then(() => {
      alert('Results copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy results');
    });
  }
}
