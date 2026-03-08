Create a full-stack TypeScript project for an Oracle Database MCP Agent Server with an Angular frontend.

Requirements:
1. Use a monorepo-style structure:
   - /server = Node.js + TypeScript MCP server
   - /api = Node.js + Express REST API
   - /client = Angular application
2. The MCP server must:
   - use @modelcontextprotocol/sdk
   - expose tools:
     - get_schema_info(owner)
     - run_readonly_query(sql, binds, maxRows)
     - get_trade_by_id(tradeId)
     - search_orders(status, limit)
   - connect to Oracle using the oracledb package
   - use connection pooling
   - allow only read-only SELECT/WITH SQL
   - use bind variables
   - return JSON responses
3. The REST API must:
   - expose endpoints:
     - GET /health
     - POST /query
     - POST /schema
     - POST /trade
   - call the MCP server internally and return tool results to the Angular client
   - handle errors cleanly
4. The Angular frontend must:
   - be created with standalone components
   - have a clean enterprise UI
   - include:
     - a query form
     - schema lookup form
     - trade lookup form
     - results panel
     - loading spinner
     - error message display
   - use Angular HttpClient to call the REST API
   - show formatted JSON response from the server
5. Add environment configuration:
   - ORACLE_USER
   - ORACLE_PASSWORD
   - ORACLE_CONNECT_STRING
   - PORT
6. Add sample Oracle SQL for:
   - getting schema metadata from all_tab_columns
   - getting a trade by ID from a trades table
   - searching orders from an orders table
7. Add security guardrails:
   - block INSERT/UPDATE/DELETE/ALTER/DROP/TRUNCATE
   - maxRows limit of 500
   - schema allowlist option
8. Add logging and comments for all major files.
9. Generate all code files fully, not placeholders.
10. Include package.json scripts for:
   - server dev
   - api dev
   - angular start
   - full local run
11. Include a README with setup steps for Windows PowerShell:
   - npm install
   - how to run Angular client
   - how to run API
   - how to run MCP server
   - how to test from browser and Postman

Expected flow:
Angular UI -> Express API -> MCP server -> Oracle DB -> MCP server response -> API response -> Angular UI display.

Use these technologies:
- Angular latest
- Node.js
- TypeScript
- Express
- @modelcontextprotocol/sdk
- oracledb
- RxJS
- Angular HttpClient

Generate production-style code with clear folder structure.

---

## INSTRUCTION TRACKING

**IMPORTANT**: All future instructions provided by the user will be logged here for reference and implementation.

The following format will be used to track instructions:
- **Date**: When the instruction was received
- **Instruction**: The details of what needs to be done
- **Status**: Whether it's been completed or is in progress

### Completed Tasks

#### 1. Initial Project Setup - COMPLETED
- **Date**: March 7, 2026
- **Instruction**: Create a full-stack TypeScript project for an Oracle Database MCP Agent Server with Angular frontend
- **Status**: ✅ COMPLETED
- **Details**:
  - Created monorepo structure with /server, /api, /client directories
  - MCP Server: Node.js + TypeScript with 4 tools (get_schema_info, run_readonly_query, get_trade_by_id, search_orders)
  - Express API: REST endpoints for all MCP tools
  - Angular Client: Standalone components with clean enterprise UI
  - Comprehensive documentation (README.md, QUICK_START.md, SAMPLE_QUERIES.md)
  - All dependencies installed and TypeScript compiled successfully

#### 2. Install Dependencies - COMPLETED
- **Date**: March 7, 2026
- **Instruction**: Install dependencies for all components (MCP Server, Express API, Angular Client)
- **Status**: ✅ COMPLETED
- **Details**:
  - MCP Server: 38 packages installed, TypeScript compiled
  - Express API: 108 packages installed, TypeScript compiled
  - Angular Client: Dependencies installed (with 42 vulnerabilities to address if needed)

#### 3. Fix Console Error - COMPLETED
- **Date**: March 8, 2026
- **Instruction**: Fix the console error when running the MCP server
- **Status**: ✅ COMPLETED
- **Details**:
  - Issue: MCP SDK's setRequestHandler was being called with string parameters instead of schema objects
  - Solution: Updated server/src/index.ts to use ListToolsRequestSchema and CallToolRequestSchema from @modelcontextprotocol/sdk/types
  - Server now successfully starts with messages:
    - "Oracle database pool initialized successfully"
    - "Oracle MCP Server started and connected"
  - Build completes without errors

#### 4. Fix Angular Configuration - COMPLETED
- **Date**: March 8, 2026
- **Instruction**: Fix angular.json "Unknown format - version specifier not found" error
- **Status**: ✅ COMPLETED
- **Details**:
  - Issue: angular.json was missing required schema and version fields
  - Solution: Added $schema, version, and newProjectRoot to angular.json
  - Angular dev server now compiles successfully
  - Running on http://localhost:4200

### Future Instructions

Any future instructions will be logged below with date, details, and completion status.