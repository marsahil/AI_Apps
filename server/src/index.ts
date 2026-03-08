/**
 * Oracle Database MCP Agent Server
 * Main entry point for the Model Context Protocol server
 * Exposes tools for interacting with Oracle Database in a secure read-only manner
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { database } from './database.js';
import { logger } from './logger.js';

// Initialize environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Define available tools for the MCP server
 */
const tools: Tool[] = [
  {
    name: 'get_schema_info',
    description: 'Get schema information for a specific owner from all_tab_columns. Returns table and column metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        owner: {
          type: 'string',
          description: 'The schema owner name (e.g., SCOTT, HR)'
        }
      },
      required: ['owner']
    }
  },
  {
    name: 'run_readonly_query',
    description: 'Execute a read-only SELECT or WITH query with bind variables. Only SELECT and WITH statements are allowed. Maximum 500 rows returned.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        sql: {
          type: 'string',
          description: 'The SELECT or WITH SQL query to execute'
        },
        binds: {
          type: 'object',
          description: 'Bind variables as key-value pairs',
          additionalProperties: true
        },
        maxRows: {
          type: 'number',
          description: 'Maximum number of rows to return (default: 500, max: 500)'
        }
      },
      required: ['sql']
    }
  },
  {
    name: 'get_trade_by_id',
    description: 'Retrieve a specific trade by trade ID from the trades table.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tradeId: {
          type: 'string',
          description: 'The trade ID to look up'
        }
      },
      required: ['tradeId']
    }
  },
  {
    name: 'list_trades',
    description: 'List all trades from the trades table with optional limit. Returns trade records.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of trades to return (default: 100, max: 500)'
        }
      },
      required: []
    }
  },
  {
    name: 'search_orders',
    description: 'Search for orders by status with optional limit. Returns matching orders from the orders table.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        status: {
          type: 'string',
          description: 'The order status to filter by (e.g., PENDING, COMPLETED, CANCELLED)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of orders to return (default: 100, max: 500)'
        }
      },
      required: ['status']
    }
  }
];

/**
 * Create the MCP server
 */
const server = new Server(
  {
    name: 'oracle-mcp-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Handler for listing tools
 */
server.setRequestHandler(
  ListToolsRequestSchema,
  async () => {
    logger.info('List tools requested');
    return { tools };
  }
);

/**
 * Handler for tool calls
 */
server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {
    const toolName = request.params?.name;
    const args = request.params?.arguments;

    logger.info(`Tool requested: ${toolName}`, { args });

    try {
      let result: any;

      switch (toolName) {
        case 'get_schema_info':
          result = await database.getSchemaInfo(args?.owner as string);
          break;

        case 'run_readonly_query':
          result = await database.executeQuery(
            args?.sql as string,
            args?.binds as Record<string, any>,
            args?.maxRows as number | undefined
          );
          break;

        case 'get_trade_by_id':
          result = await database.getTradeById(args?.tradeId as string);
          break;

        case 'list_trades':
          result = await database.listTrades(args?.limit as number | undefined);
          break;

        case 'search_orders':
          result = await database.searchOrders(
            args?.status as string,
            args?.limit as number | undefined
          );
          break;

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      logger.info(`Tool ${toolName} executed successfully`);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      logger.error(`Tool ${toolName} execution failed`, error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: errorMessage,
                tool: toolName
              },
              null,
              2
            )
          }
        ],
        isError: true
      };
    }
  }
);

/**
 * Start the MCP server
 */
async function start(): Promise<void> {
  try {
    logger.info('Starting Oracle MCP Server');

    // Initialize database connection pool
    await database.initialize();

    // Start the server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Oracle MCP Server started and connected');
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  await database.close();
  process.exit(0);
});

// Start the server
start().catch((error) => {
  logger.error('Fatal error starting server', error);
  process.exit(1);
});
