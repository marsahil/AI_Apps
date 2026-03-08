/**
 * Express REST API for Oracle MCP Server
 * Exposes HTTP endpoints that call the MCP server tools
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { mcpClient } from './mcpClient.js';
import { logger } from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, { query: req.query, body: req.body });
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mcpConnected: mcpClient.isReady()
  });
});

/**
 * Get schema information endpoint
 * POST /schema
 * Body: { owner: string }
 */
app.post('/schema', async (req: Request, res: Response) => {
  try {
    const { owner } = req.body;

    if (!owner) {
      return res.status(400).json({
        error: 'Missing required parameter: owner'
      });
    }

    logger.info(`Getting schema info for owner: ${owner}`);
    const result = await mcpClient.getSchemaInfo(owner);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting schema info', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to get schema information',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Execute read-only query endpoint
 * POST /query
 * Body: { sql: string, binds?: object, maxRows?: number }
 */
app.post('/query', async (req: Request, res: Response) => {
  try {
    const { sql, binds, maxRows } = req.body;

    if (!sql) {
      return res.status(400).json({
        error: 'Missing required parameter: sql'
      });
    }

    logger.info('Executing read-only query');
    const result = await mcpClient.runReadonlyQuery(sql, binds, maxRows);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error executing query', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to execute query',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get trade by ID endpoint
 * POST /trade
 * Body: { tradeId: string }
 */
app.post('/trade', async (req: Request, res: Response) => {
  try {
    const { tradeId } = req.body;

    if (!tradeId) {
      return res.status(400).json({
        error: 'Missing required parameter: tradeId'
      });
    }

    logger.info(`Getting trade: ${tradeId}`);
    const result = await mcpClient.getTradeById(tradeId);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting trade', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to get trade',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * List trades endpoint
 * POST /trades
 * Body: { limit?: number }
 */
app.post('/trades', async (req: Request, res: Response) => {
  try {
    const { limit } = req.body;

    logger.info('Listing trades', { limit });
    const result = await mcpClient.listTrades(limit);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error listing trades', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to list trades',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Search orders endpoint
 * POST /orders/search
 * Body: { status: string, limit?: number }
 */
app.post('/orders/search', async (req: Request, res: Response) => {
  try {
    const { status, limit } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Missing required parameter: status'
      });
    }

    logger.info(`Searching orders with status: ${status}`);
    const result = await mcpClient.searchOrders(status, limit);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error searching orders', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: 'Failed to search orders',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Error handling middleware
 */
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

/**
 * Initialize server and connect to MCP server
 */
async function start(): Promise<void> {
  try {
    logger.info('Starting Express API server');

    // Connect to MCP server
    await mcpClient.connect();

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Express API server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start API server', error);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await mcpClient.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await mcpClient.disconnect();
  process.exit(0);
});

// Start the server
start().catch((error) => {
  logger.error('Fatal error starting API server', error);
  process.exit(1);
});
