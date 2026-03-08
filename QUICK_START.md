# Quick Start Guide - Windows PowerShell

## One-Time Setup (5 minutes)

### 1. Open PowerShell and navigate to the project

```powershell
cd "e:\AI-Development\Agentic-AI\AI_Apps"
```

### 2. Install dependencies for all components

```powershell
# MCP Server
cd server
npm install
npm run build

# Express API
cd ../api
npm install
npm run build

# Angular Client
cd ../client
npm install
```

### 3. Configure Oracle connection

```powershell
# Update server/.env with your Oracle credentials
cd server
notepad .env
```

Update these values:
- ORACLE_USER=your_username
- ORACLE_PASSWORD=your_password
- ORACLE_CONNECT_STRING=your_host:1521/your_sid

## Running the Application

### Step 1: Start MCP Server (Terminal 1)

```powershell
cd server
npm run dev
```

Wait for: "Oracle database pool initialized successfully"

### Step 2: Start Express API (Terminal 2)

```powershell
cd api
npm run dev
```

Wait for: "Express API server running on port 3002"

### Step 3: Start Angular Client (Terminal 3)

```powershell
cd client
npm start
```

Opens: http://localhost:4200 in your browser

## Testing the Application

### Test 1: Check Health Status
Click the health status indicator in the header - should show "Connected"

### Test 2: Schema Lookup
1. Click "Schema" tab
2. Enter "SCOTT" (or your schema name)
3. Click "Get Schema Info"
4. View table/column metadata

### Test 3: Execute Query
1. Click "Query" tab
2. Paste: `SELECT * FROM all_tables WHERE OWNER = :owner FETCH FIRST :limit ROWS ONLY`
3. Add binds: `{"owner": "SCOTT", "limit": 10}`
4. Click "Execute Query"

### Test 4: Trade Lookup
1. Click "Trade" tab
2. Enter a trade ID
3. Click "Get Trade"

### Test 5: Order Search
1. Click "Orders" tab
2. Select "PENDING" status
3. Click "Search Orders"

## Browser Access

- **Local**: http://localhost:4200
- **Dev Tools**: F12 for JavaScript console
- **Network tab** to inspect API calls

## API Testing with Postman

### Import Request
```
POST http://localhost:3002/query
Content-Type: application/json

{
  "sql": "SELECT * FROM all_tables WHERE OWNER = :owner FETCH FIRST :limit ROWS ONLY",
  "binds": {
    "owner": "SCOTT",
    "limit": 10
  },
  "maxRows": 50
}
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "columns": ["TABLE_NAME", ...],
    "rows": [...],
    "rowCount": 10
  },
  "timestamp": "2026-03-07T00:00:00.000Z"
}
```

## Stopping Services

In each terminal:
```powershell
Ctrl + C
```

## Troubleshooting

### "Oracle database pool failed to initialize"
- Check Oracle connection string format
- Verify username and password
- Confirm Oracle is running

### "ECONNREFUSED on port 3002"
- Ensure MCP server (Terminal 1) started successfully
- Re-start API server (Terminal 2)

### "Angular dev server won't start"
- Check Node.js version: `node --version` (need v18+)
- Delete node_modules and reinstall: `npm install`
- Try different port: `ng serve --port 4300`

### "CORS error in browser console"
- Restart Express API server
- Verify API is running on port 3002

## Production Build

### Build all components for production

```powershell
# MCP Server
cd server
npm run build

# Express API  
cd ../api
npm run build

# Angular Client
cd ../client
npm run build
```

### Run production builds

Terminal 1:
```powershell
cd server && npm start
```

Terminal 2:
```powershell
cd api && npm start
```

Terminal 3:
```powershell
cd client && npm start
```

Or use compiled Angular with static server:
```powershell
cd client
npx http-server dist/oracle-mcp-client -p 4200
```

## Next Steps

1. ✅ Install and run application
2. ✅ Test with sample queries from SAMPLE_QUERIES.md
3. ✅ Create custom views in Angular for your business needs
4. ✅ Deploy API server to production
5. ✅ Configure CDN for Angular static files

## Documentation

- `README.md` - Full documentation
- `SAMPLE_QUERIES.md` - Example SQL queries
- `server/src/` - MCP server source with comments
- `api/src/` - Express API source with comments
- `client/src/` - Angular components with detailed docs

## Support Files

Located in project root:
- `.env.example` - Environment template (in each folder)
- `package.json` - In each folder for dependencies
- `tsconfig.json` - TypeScript configuration

Enjoy your Oracle Database MCP Agent! 🚀
