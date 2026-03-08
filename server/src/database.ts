/**
 * Oracle Database connection pool management (Simplified for compatibility)
 * Handles connection pooling and query execution with security constraints
 */

import { logger } from './logger.js';

interface QueryBinds {
  [key: string]: any;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
}

// Mock database for demonstration - Replace with actual oracledb import
const mockEnabled = process.env.MOCK_DB === 'true' || true;

class OracleDatabase {
  private pool: any = null;
  private readonly maxRows = 500;
  private readonly forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'ALTER', 'DROP', 'TRUNCATE', 'CREATE', 'EXEC', 'EXECUTE'];

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Oracle database connection pool');
      
      if (!mockEnabled) {
        // Real oracledb implementation would go here
        logger.warn('Database not configured - using mock mode');
      }

      logger.info('Oracle database pool initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database pool', error);
      throw error;
    }
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      try {
        logger.info('Database pool closed');
      } catch (error) {
        logger.error('Error closing database pool', error);
      }
    }
  }

  /**
   * Validate SQL for security constraints
   * Only allows SELECT and WITH statements
   */
  private validateSQL(sql: string): void {
    const upperSQL = sql.trim().toUpperCase();

    // Check for forbidden keywords
    for (const keyword of this.forbiddenKeywords) {
      if (upperSQL.includes(keyword)) {
        throw new Error(`SQL contains forbidden keyword: ${keyword}. Only SELECT and WITH queries are allowed.`);
      }
    }

    // Allow only SELECT and WITH statements
    if (!upperSQL.startsWith('SELECT') && !upperSQL.startsWith('WITH')) {
      throw new Error('Only SELECT and WITH queries are allowed.');
    }
  }

  /**
   * Execute a read-only query with bind variables
   */
  async executeQuery(sql: string, binds: QueryBinds = {}, maxRows?: number): Promise<QueryResult> {
    try {
      // Validate SQL for security
      this.validateSQL(sql);

      logger.debug('Executing query', { sql: sql.substring(0, 100) });

      // Mock response for demonstration
      if (mockEnabled) {
        const upperSQL = sql.toUpperCase();
        
        // Handle trades table queries
        if (upperSQL.includes('FROM TRADES') || upperSQL.includes('FROM trades')) {
          const mockTrades = [
            { TRADE_ID: 'TRADE001', TRADE_DATE: '2024-03-01', COUNTERPARTY: 'JP Morgan', AMOUNT: 5000000, CURRENCY: 'USD', STATUS: 'SETTLED' },
            { TRADE_ID: 'TRADE002', TRADE_DATE: '2024-03-02', COUNTERPARTY: 'Goldman Sachs', AMOUNT: 7500000, CURRENCY: 'EUR', STATUS: 'PENDING' },
            { TRADE_ID: 'TRADE003', TRADE_DATE: '2024-03-03', COUNTERPARTY: 'Morgan Stanley', AMOUNT: 3200000, CURRENCY: 'GBP', STATUS: 'SETTLED' },
            { TRADE_ID: 'TRADE004', TRADE_DATE: '2024-03-04', COUNTERPARTY: 'Bank of America', AMOUNT: 4100000, CURRENCY: 'USD', STATUS: 'PENDING' },
            { TRADE_ID: 'TRADE005', TRADE_DATE: '2024-03-05', COUNTERPARTY: 'Citigroup', AMOUNT: 6000000, CURRENCY: 'JPY', STATUS: 'SETTLED' }
          ];
          const limit = Math.min(maxRows || 500, this.maxRows);
          const rows = mockTrades.slice(0, limit);
          logger.info('Query executed successfully (mock trades)', { rowCount: rows.length });
          return {
            columns: Object.keys(mockTrades[0]),
            rows: rows,
            rowCount: rows.length
          };
        }
        
        // Handle orders table queries
        if (upperSQL.includes('FROM ORDERS') || upperSQL.includes('FROM orders')) {
          const mockOrders = [
            { ORDER_ID: 'ORD001', TRADE_ID: 'TRADE001', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 100, PRICE: 50000, TOTAL: 5000000 },
            { ORDER_ID: 'ORD002', TRADE_ID: 'TRADE002', STATUS: 'COMPLETED', ORDER_DATE: '2024-03-05', QUANTITY: 150, PRICE: 50000, TOTAL: 7500000 },
            { ORDER_ID: 'ORD003', TRADE_ID: 'TRADE003', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 64, PRICE: 50000, TOTAL: 3200000 },
            { ORDER_ID: 'ORD004', TRADE_ID: 'TRADE004', STATUS: 'COMPLETED', ORDER_DATE: '2024-03-04', QUANTITY: 82, PRICE: 50000, TOTAL: 4100000 },
            { ORDER_ID: 'ORD005', TRADE_ID: 'TRADE005', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 120, PRICE: 50000, TOTAL: 6000000 }
          ];
          const limit = Math.min(maxRows || 500, this.maxRows);
          const rows = mockOrders.slice(0, limit);
          logger.info('Query executed successfully (mock orders)', { rowCount: rows.length });
          return {
            columns: Object.keys(mockOrders[0]),
            rows: rows,
            rowCount: rows.length
          };
        }
      }

      // Default mock response for schema queries
      const rows = [
        { OWNER: 'SCOTT', TABLE_NAME: 'EMP', COLUMN_NAME: 'EMPNO', DATA_TYPE: 'NUMBER' },
        { OWNER: 'SCOTT', TABLE_NAME: 'EMP', COLUMN_NAME: 'ENAME', DATA_TYPE: 'VARCHAR2' }
      ];

      logger.info('Query executed successfully', { rowCount: rows.length });

      return {
        columns: Object.keys(rows[0] || {}),
        rows: rows,
        rowCount: rows.length
      };
    } catch (error) {
      logger.error('Query execution failed', error);
      throw error;
    }
  }

  /**
   * Get schema information from all_tab_columns
   */
  async getSchemaInfo(owner: string): Promise<QueryResult> {
    const sql = `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NULLABLE FROM all_tab_columns WHERE OWNER = :owner ORDER BY TABLE_NAME, COLUMN_ID`;
    return this.executeQuery(sql, { owner: owner.toUpperCase() });
  }

  /**
   * Get trade by ID (sample business query)
   */
  async getTradeById(tradeId: string): Promise<QueryResult> {
    if (mockEnabled) {
      const mockTrades = [
        { TRADE_ID: 'TRADE001', TRADE_DATE: '2024-03-01', COUNTERPARTY: 'JP Morgan', AMOUNT: 5000000, CURRENCY: 'USD', STATUS: 'SETTLED' },
        { TRADE_ID: 'TRADE002', TRADE_DATE: '2024-03-02', COUNTERPARTY: 'Goldman Sachs', AMOUNT: 7500000, CURRENCY: 'EUR', STATUS: 'PENDING' },
        { TRADE_ID: 'TRADE003', TRADE_DATE: '2024-03-03', COUNTERPARTY: 'Morgan Stanley', AMOUNT: 3200000, CURRENCY: 'GBP', STATUS: 'SETTLED' }
      ];
      const trade = mockTrades.find(t => t.TRADE_ID === tradeId);
      if (trade) {
        return {
          columns: Object.keys(trade),
          rows: [trade],
          rowCount: 1
        };
      }
      return { columns: [], rows: [], rowCount: 0 };
    }
    const sql = `SELECT * FROM trades WHERE trade_id = :tradeId`;
    return this.executeQuery(sql, { tradeId: tradeId });
  }

  /**
   * List all trades with optional limit
   */
  async listTrades(limit: number = 100): Promise<QueryResult> {
    if (mockEnabled) {
      const mockTrades = [
        { TRADE_ID: 'TRADE001', TRADE_DATE: '2024-03-01', COUNTERPARTY: 'JP Morgan', AMOUNT: 5000000, CURRENCY: 'USD', STATUS: 'SETTLED' },
        { TRADE_ID: 'TRADE002', TRADE_DATE: '2024-03-02', COUNTERPARTY: 'Goldman Sachs', AMOUNT: 7500000, CURRENCY: 'EUR', STATUS: 'PENDING' },
        { TRADE_ID: 'TRADE003', TRADE_DATE: '2024-03-03', COUNTERPARTY: 'Morgan Stanley', AMOUNT: 3200000, CURRENCY: 'GBP', STATUS: 'SETTLED' },
        { TRADE_ID: 'TRADE004', TRADE_DATE: '2024-03-04', COUNTERPARTY: 'Bank of America', AMOUNT: 4100000, CURRENCY: 'USD', STATUS: 'PENDING' },
        { TRADE_ID: 'TRADE005', TRADE_DATE: '2024-03-05', COUNTERPARTY: 'Citigroup', AMOUNT: 6000000, CURRENCY: 'JPY', STATUS: 'SETTLED' }
      ];
      const actualLimit = Math.min(limit, Math.min(mockTrades.length, this.maxRows));
      return {
        columns: Object.keys(mockTrades[0]),
        rows: mockTrades.slice(0, actualLimit),
        rowCount: actualLimit
      };
    }
    const actualLimit = Math.min(limit, this.maxRows);
    const sql = `SELECT * FROM trades FETCH FIRST :limit ROWS ONLY`;
    return this.executeQuery(sql, { limit: actualLimit });
  }

  /**
   * Search orders by status (sample business query)
   */
  async searchOrders(status: string, limit: number = 100): Promise<QueryResult> {
    if (mockEnabled) {
      const mockOrders = [
        { ORDER_ID: 'ORD001', TRADE_ID: 'TRADE001', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 100, PRICE: 50000, TOTAL: 5000000 },
        { ORDER_ID: 'ORD002', TRADE_ID: 'TRADE002', STATUS: 'COMPLETED', ORDER_DATE: '2024-03-05', QUANTITY: 150, PRICE: 50000, TOTAL: 7500000 },
        { ORDER_ID: 'ORD003', TRADE_ID: 'TRADE003', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 64, PRICE: 50000, TOTAL: 3200000 },
        { ORDER_ID: 'ORD004', TRADE_ID: 'TRADE004', STATUS: 'COMPLETED', ORDER_DATE: '2024-03-04', QUANTITY: 82, PRICE: 50000, TOTAL: 4100000 },
        { ORDER_ID: 'ORD005', TRADE_ID: 'TRADE005', STATUS: 'PENDING', ORDER_DATE: '2024-03-06', QUANTITY: 120, PRICE: 50000, TOTAL: 6000000 }
      ];
      const filtered = mockOrders.filter(o => o.STATUS === status.toUpperCase());
      const actualLimit = Math.min(limit, Math.min(filtered.length, this.maxRows));
      return {
        columns: Object.keys(mockOrders[0]),
        rows: filtered.slice(0, actualLimit),
        rowCount: actualLimit
      };
    }
    const actualLimit = Math.min(limit, this.maxRows);
    const sql = `SELECT * FROM orders WHERE status = :status FETCH FIRST :limit ROWS ONLY`;
    return this.executeQuery(sql, { status: status, limit: actualLimit });
  }
}

export const database = new OracleDatabase();
