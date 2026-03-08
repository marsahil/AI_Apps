/**
 * MCP Server Client - Communicates with the Oracle MCP Server
 * Handles calling MCP tools and managing the connection
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { logger } from './logger.js';
import { spawn, ChildProcess } from 'child_process';

class MCPServerClient {
  private client: Client | null = null;
  private serverProcess: ChildProcess | null = null;
  private isConnected: boolean = false;

  /**
   * Initialize connection to the MCP server
   * Spawns the server process and establishes stdio connection
   */
  async connect(): Promise<void> {
    try {
      logger.info('Connecting to MCP server');

      // Spawn the MCP server process
      this.serverProcess = spawn('node', ['../server/dist/index.js'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        cwd: process.cwd()
      });

      if (!this.serverProcess.stdout || !this.serverProcess.stdin) {
        throw new Error('Failed to establish stdio connection with MCP server');
      }

      // Create stdio transport
      const transport = new StdioClientTransport({
        command: 'node',
        args: ['../server/dist/index.js']
      } as any);

      // Create client and connect
      this.client = new Client(
        {
          name: 'oracle-api-client',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      );

      await this.client.connect(transport);
      this.isConnected = true;

      logger.info('Successfully connected to MCP server');
    } catch (error) {
      logger.error('Failed to connect to MCP server', error);
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
      }
      if (this.serverProcess) {
        this.serverProcess.kill();
      }
      this.isConnected = false;
      logger.info('Disconnected from MCP server');
    } catch (error) {
      logger.error('Error disconnecting from MCP server', error);
    }
  }

  /**
   * Check if connected to MCP server
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(toolName: string, toolInput: Record<string, any>): Promise<any> {
    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    try {
      logger.debug(`Calling MCP tool: ${toolName}`, { input: toolInput });

      const result = await (this.client as any).callTool({
        name: toolName,
        arguments: toolInput
      });

      logger.debug(`MCP tool ${toolName} returned successfully`);
      
      // Extract and parse the text content from MCP response
      if (result && result.content && Array.isArray(result.content) && result.content.length > 0) {
        const textContent = result.content.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          try {
            return JSON.parse(textContent.text);
          } catch (parseError) {
            logger.warn(`Failed to parse MCP response as JSON for tool ${toolName}`, parseError);
            return textContent.text;
          }
        }
      }
      
      return result;
    } catch (error) {
      logger.error(`Failed to call MCP tool ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Get schema info from MCP server
   */
  async getSchemaInfo(owner: string): Promise<any> {
    return this.callTool('get_schema_info', { owner });
  }

  /**
   * Run read-only query on MCP server
   */
  async runReadonlyQuery(sql: string, binds?: Record<string, any>, maxRows?: number): Promise<any> {
    return this.callTool('run_readonly_query', {
      sql,
      binds: binds || {},
      maxRows: maxRows || 500
    });
  }

  /**
   * Get trade by ID from MCP server
   */
  async getTradeById(tradeId: string): Promise<any> {
    return this.callTool('get_trade_by_id', { tradeId });
  }

  /**
   * List all trades from MCP server
   */
  async listTrades(limit?: number): Promise<any> {
    return this.callTool('list_trades', {
      limit: limit || 100
    });
  }

  /**
   * Search orders from MCP server
   */
  async searchOrders(status: string, limit?: number): Promise<any> {
    return this.callTool('search_orders', {
      status,
      limit: limit || 100
    });
  }
}

export const mcpClient = new MCPServerClient();
