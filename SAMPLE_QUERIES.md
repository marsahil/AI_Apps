# Sample Oracle SQL Queries for Testing

## Schema Information Queries

### Get all tables in a schema
```sql
SELECT TABLE_NAME, NUM_ROWS
FROM all_tables
WHERE OWNER = 'SCOTT'
ORDER BY TABLE_NAME;
```

### Get columns for a specific table
```sql
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NULLABLE, COLUMN_ID
FROM all_tab_columns
WHERE OWNER = 'SCOTT' AND TABLE_NAME = 'EMP'
ORDER BY COLUMN_ID;
```

### Get table constraints
```sql
SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, TABLE_NAME
FROM all_constraints
WHERE OWNER = 'SCOTT'
ORDER BY TABLE_NAME;
```

### Get indexes on tables
```sql
SELECT INDEX_NAME, TABLE_NAME, UNIQUENESS
FROM all_indexes
WHERE OWNER = 'SCOTT'
ORDER BY TABLE_NAME;
```

## Business Data Queries (Examples)

### Get trade details
```sql
SELECT 
    trade_id,
    trade_date,
    instrument,
    quantity,
    price,
    amount,
    status,
    created_by,
    created_date
FROM trades
WHERE trade_id = :trade_id;
```

### Search orders by status
```sql
SELECT 
    order_id,
    trade_id,
    order_date,
    status,
    amount,
    quantity,
    unit_price
FROM orders
WHERE status = :status
ORDER BY order_date DESC
FETCH FIRST :limit ROWS ONLY;
```

### Get recent trades with order count
```sql
SELECT 
    t.trade_id,
    t.trade_date,
    t.instrument,
    t.amount,
    COUNT(o.order_id) as order_count,
    SUM(o.amount) as total_orders
FROM trades t
LEFT JOIN orders o ON t.trade_id = o.trade_id
WHERE t.trade_date >= TRUNC(SYSDATE) - :days
GROUP BY t.trade_id, t.trade_date, t.instrument, t.amount
ORDER BY t.trade_date DESC;
```

### Complex CTE query for dashboard
```sql
WITH order_summary AS (
    SELECT 
        o.status,
        COUNT(*) as order_count,
        SUM(o.amount) as total_amount,
        AVG(o.amount) as avg_amount
    FROM orders o
    GROUP BY o.status
),
trade_stats AS (
    SELECT 
        COUNT(*) as total_trades,
        SUM(amount) as total_trade_amount,
        COUNT(DISTINCT instrument) as instrument_count
    FROM trades
    WHERE trade_date >= TRUNC(SYSDATE) - 30
)
SELECT 
    os.*,
    ts.total_trades,
    ts.total_trade_amount,
    ts.instrument_count
FROM order_summary os
CROSS JOIN trade_stats ts;
```

### Search with bind variables example
```sql
SELECT 
    t.*,
    o.order_id,
    o.order_date
FROM trades t
LEFT JOIN orders o ON t.trade_id = o.trade_id
WHERE 1=1
    AND t.instrument = :instrument
    AND t.trade_date BETWEEN TRUNC(:start_date) AND TRUNC(:end_date)
    AND t.amount >= :min_amount
ORDER BY t.trade_date DESC
FETCH FIRST :limit ROWS ONLY;
```

### Bind variables for the above query
```json
{
    "instrument": "EUR/USD",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "min_amount": 10000,
    "limit": 100
}
```

## Performance Check Queries

### Check table statistics
```sql
SELECT TABLE_NAME, NUM_ROWS, BYTES, LAST_ANALYZED
FROM user_tables
ORDER BY BYTES DESC;
```

### Find expensive queries (if you have query stats)
```sql
SELECT 
    SQL_ID,
    MODULE,
    EXECUTIONS,
    ELAPSED_TIME,
    BUFFER_GETS,
    ROWS_PROCESSED
FROM v$sql
WHERE EXECUTIONS > 0
ORDER BY ELAPSED_TIME DESC
FETCH FIRST 20 ROWS ONLY;
```

### Check privileges
```sql
SELECT PRIVILEGE
FROM user_sys_privs
UNION ALL
SELECT PRIVILEGE
FROM user_tab_privs
WHERE OWNER != USER;
```

## Notes for Testing

1. **Replace owner names**: Change 'SCOTT' to your actual schema
2. **Adjust dates**: Modify date ranges for your data period
3. **Bind variables**: Use :variable_name format in SQL
4. **Test incrementally**: Start with simple SELECT before complex CTEs
5. **Monitor results**: Keep an eye on row counts and performance
6. **Use Postman**: Post the SQL and binds as JSON to test the API

## Example API Payload

```json
{
    "sql": "SELECT * FROM all_tables WHERE OWNER = :owner FETCH FIRST :limit ROWS ONLY",
    "binds": {
        "owner": "SCOTT",
        "limit": 20
    },
    "maxRows": 100
}
```

## Common Errors & Solutions

### ORA-00942: table or view does not exist
- Check schema and table name
- Verify you have SELECT privilege
- Check if table is accessible from your connection

### ORA-01858: a non-numeric character was found where a numeric one was expected
- Check date format (typically YYYY-MM-DD)
- Verify bind variable types match

### ORA-01008: not all variables bound
- Ensure all :variables in SQL are in binds object
- Check variable names match exactly
