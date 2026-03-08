# Oracle Database MCP Agent - Full Stack Application

A production-ready full-stack TypeScript application providing an enterprise Oracle Database query interface using the Model Context Protocol (MCP). Features a Node.js MCP server, Express REST API, and Angular frontend with standalone components.

## Project Structure

```
AI_Apps/
├── server/           # MCP Server (Node.js + TypeScript)
├── api/              # Express REST API (Node.js + TypeScript)
├── client/           # Angular Standalone Components Frontend
└── README.md         # This file
```

## Architecture

```
Angular UI (Port 3000)
    ↓ HTTP
Express API (Port 3002)
    ↓ Stdio
MCP Server (Port 3001)
    ↓ oracledb
Oracle Database
```

## Features

- **Secure Read-Only Access**: Only SELECT and WITH queries allowed
- **Bind Variable Support**: Parameterized queries prevent SQL injection
- **Connection Pooling**: Efficient database connection management
- **Comprehensive Tools**:
  - `get_schema_info` - View table/column metadata
  - `run_readonly_query` - Execute custom SELECT queries
  - `get_trade_by_id` - Retrieve specific trades
  - `search_orders` - Search orders by status
- **Enterprise UI**: Clean, responsive Angular interface
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Input validation, SQL keyword filtering, max row limits (500)

## Prerequisites

- Windows PowerShell 5.1+
- Node.js 18.0+
- npm 9.0+
- Oracle Database (with connection string)
- Oracle Instant Client (for oracledb connectivity)

## Installation & Setup (Windows PowerShell)

### 1. Install Global Dependencies

```powershell
npm install -g @angular/cli
```

### 2. Setup MCP Server

```powershell
cd server
npm install
```

Create `.env` file and configure Oracle credentials:
```powershell
$env:ORACLE_USER = 'your_username'
$env:ORACLE_PASSWORD = 'your_password'
$env:ORACLE_CONNECT_STRING = 'localhost:1521/XEPDB1'
$env:MCP_PORT = '3001'
```

Or copy `.env.example` to `.env` and update:
```powershell
Copy-Item .env.example .env
notepad .env
```

Build the TypeScript:
```powershell
npm run build
```

### 3. Setup Express API

```powershell
cd ../api
npm install
```

Create `.env` file:
```powershell
Copy-Item .env.example .env
notepad .env
```

Configure if needed (MCP server connection defaults to localhost:3001):
```
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=3001
API_PORT=3002
NODE_ENV=development
```

Build the TypeScript:
```powershell
npm run build
```

### 4. Setup Angular Client

```powershell
cd ../client
npm install
```

No environment configuration needed. The Angular app connects to http://localhost:3002 by default.

## Running the Application

### Terminal 1 - Start MCP Server

```powershell
cd server
npm run dev
# OR for production compiled version
npm start
```

Expected output: "Oracle database pool initialized successfully"

### Terminal 2 - Start Express API

```powershell
cd api
npm run dev
# OR for production compiled version
npm start
```

Expected output: "Express API server running on port 3002"

### Terminal 3 - Start Angular Client

```powershell
cd client
npm start
```

The Angular development server will open automatically at `http://localhost:4200`

## Usage

### Query Form Tab
- Write custom SELECT or WITH queries
- Add bind variables as JSON
- Set maximum rows to return (default: 500, max: 500)
- View formatted results

### Schema Tab
- Enter a schema owner name (e.g., SCOTT, HR)
- View all tables and columns for that schema
- Returns metadata from all_tab_columns

### Trade Tab
- Enter a trade ID
- Retrieve complete trade information
- Queries the trades table

### Orders Tab
- Select an order status (PENDING, PROCESSING, COMPLETED, CANCELLED, FAILED)
- Set optional limit
- Search orders from the orders table

## Testing with Postman

### Health Check
```
GET http://localhost:3002/health
```

### Execute Query
```
POST http://localhost:3002/query
Content-Type: application/json

{
  "sql": "SELECT * FROM all_tables WHERE owner = :owner FETCH FIRST :limit ROWS ONLY",
  "binds": {
    "owner": "SCOTT",
    "limit": 10
  },
  "maxRows": 50
}
```

### Get Schema Info
```
POST http://localhost:3002/schema
Content-Type: application/json

{
  "owner": "SCOTT"
}
```

### Get Trade
```
POST http://localhost:3002/trade
Content-Type: application/json

{
  "tradeId": "TRADE123456"
}
```

### Search Orders
```
POST http://localhost:3002/orders/search
Content-Type: application/json

{
  "status": "PENDING",
  "limit": 100
}
```

## Sample SQL Queries

### View Schema Metadata
```sql
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NULLABLE
FROM all_tab_columns
WHERE OWNER = 'SCOTT'
ORDER BY TABLE_NAME, COLUMN_ID;
```

### Search Trades
```sql
SELECT * FROM trades
WHERE trade_id = :trade_id;
```

### Search Orders
```sql
SELECT * FROM orders
WHERE status = :status
FETCH FIRST :limit ROWS ONLY;
```

### Complex Query with CTE
```sql
WITH recent_trades AS (
  SELECT * FROM trades
  WHERE trade_date >= TRUNC(SYSDATE) - 30
)
SELECT t.trade_id, t.amount, COUNT(*) as order_count
FROM recent_trades t
JOIN orders o ON t.trade_id = o.trade_id
GROUP BY t.trade_id, t.amount;
```

## Security Features

### SQL Validation
- Blocks: INSERT, UPDATE, DELETE, ALTER, DROP, TRUNCATE, CREATE, EXEC, EXECUTE
- Allows only: SELECT, WITH statements
- Validates before execution

### Bind Variables
- All queries use bind variables (`:variable_name`)
- Prevents SQL injection attacks
- Parameters passed separately from SQL

### Row Limits
- Maximum 500 rows per query (configurable)
- Prevents excessive data transfer
- Protects database performance

### Connection Pooling
- Maximum 10 concurrent connections
- Minimum 2 connections maintained
- Automatic connection recycling

## Development Workflow

### Build All Components
```powershell
# Server
cd server
npm run build

# API
cd ../api
npm run build

# Client (if needed)
cd ../client
npm run build
```

### Watch Mode for Development
```powershell
# Server - watches and rebuilds
cd server
npm run dev

# API - watches and rebuilds
cd api
npm run dev

# Client - dev server with hot reload
cd client
npm start
```

## Environment Variables

### Server (.env)
- `ORACLE_USER` - Database username
- `ORACLE_PASSWORD` - Database password
- `ORACLE_CONNECT_STRING` - Connection string (host:port/sid)
- `MCP_PORT` - Port for MCP server (default: 3001)
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARN, ERROR)

### API (.env)
- `MCP_SERVER_HOST` - MCP server hostname (default: localhost)
- `MCP_SERVER_PORT` - MCP server port (default: 3001)
- `API_PORT` - API port (default: 3002)
- `NODE_ENV` - Environment (development, production)
- `LOG_LEVEL` - Logging level

### Client
- API URL hardcoded to `http://localhost:3002`
- Modify in `src/app/services/api.service.ts` if needed

## Logging

All components include comprehensive logging:
- Structured JSON logs with timestamps
- Configurable log levels (DEBUG, INFO, WARN, ERROR)
- Request/response logging
- Error stack traces in development

## Performance Considerations

- Connection pooling reduces database round trips
- Bind variables cache query plans
- Max 500 rows per query prevents memory issues
- Angular standalone components reduce bundle size
- Cached HTTP requests possible via interceptors

## Troubleshooting

### MCP Server Won't Connect to Oracle
- Verify Oracle connection string format
- Check Oracle Instant Client installation
- Confirm firewall allows connection
- Test with: `sqlplus username@connection_string`

### API Can't Connect to MCP Server
- Ensure MCP server is running first
- Check if MCP_SERVER_PORT matches (default: 3001)
- Verify stdio communication between processes

### Angular Client Can't Connect to API
- Ensure Express API is running
- Check CORS settings in `api/src/index.ts`
- Verify API port configuration (default: 3002)
- Check browser console for CORS errors

### Query Returns Error "Only SELECT and WITH queries allowed"
- Verify SQL starts with SELECT or WITH
- Check for forbidden keywords (INSERT, UPDATE, etc.)
- Bind variables must use `:variable_name` format

### Performance Issues
- Check query execution plans
- Verify maxRows parameter (keep under 500)
- Monitor connection pool usage
- Check database statistics

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Support

For issues or questions:
1. Check troubleshooting section
2. Review logs in console output
3. Verify environment configuration
4. Test with sample queries in Postman
