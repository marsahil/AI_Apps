/**
 * API Service for communicating with the Express REST API
 * Handles HTTP requests to query schema, execute queries, get trades, and search orders
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface QueryRequest {
  sql: string;
  binds?: Record<string, any>;
  maxRows?: number;
}

interface SchemaRequest {
  owner: string;
}

interface TradeRequest {
  tradeId: string;
}

interface OrderSearchRequest {
  status: string;
  limit?: number;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp: string;
  status?: string;
  mcpConnected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3002';

  constructor(private httpClient: HttpClient) {}

  /**
   * Check API health status
   */
  getHealth(): Observable<ApiResponse<any>> {
    return this.httpClient.get<ApiResponse<any>>(`${this.apiUrl}/health`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get schema information
   */
  getSchemaInfo(owner: string): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.apiUrl}/schema`, { owner })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Execute read-only query
   */
  executeQuery(query: QueryRequest): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.apiUrl}/query`, query)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Get trade by ID
   */
  getTradeById(tradeId: string): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.apiUrl}/trade`, { tradeId })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * List all trades
   */
  listTrades(limit?: number): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.apiUrl}/trades`, { limit })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Search orders by status
   */
  searchOrders(status: string, limit?: number): Observable<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>(`${this.apiUrl}/orders/search`, { status, limit })
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => ({
      error: error.error?.error || 'An error occurred',
      details: error.error?.details || error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }));
  }
}
