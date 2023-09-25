// Documentation
// https://typeorm.io/

const typeorm = require('typeorm');
actionParameters.ExecutionResult = SUCCESS;

const getSql = (type) => {
  if (type === 'sqlite') return "SELECT name as table_name FROM sqlite_schema WHERE type ='table' AND name NOT LIKE 'sqlite_%' order by 1";

  if (type === 'mssql')
    return `SELECT concat('[',s.NAME ,'].[',  t.NAME,']') as table_name
                                FROM SYS.tables t
                                INNER JOIN SYS.SCHEMAS s
                                ON t.SCHEMA_ID = s.SCHEMA_ID
                                WHERE t.is_ms_shipped=0 and type_desc = 'USER_TABLE'
                                ORDER BY s.NAME, t.NAME`;

  if (type === 'postgres')
    return `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' order by 1`;

  if (type === 'mysql')
    return `SELECT TABLE_NAME as table_name  FROM information_schema.tables where TABLE_TYPE ='BASE TABLE' and TABLE_SCHEMA ='${actionParameters.connection.database}' order by 1`;

  if (type === 'oracle')
    return `select owner||'.'||Decode(INSTRB(table_name,' ', 1, 1),0,table_name,'"'||table_name||'"') as table_name from all_tables order by 1`;
};

try {
  const connection = {
    name: 'sql_data',
    type: actionParameters.connection.type,
    host: actionParameters.connection.host,
    port: Number(actionParameters.connection.port),
    username: actionParameters.connection.username,
    password: actionParameters.connection.password,
    database: actionParameters.connection.database,
    options: {
      instanceName: actionParameters.connection.instanceName,
      encrypt: false,
    },
  };

  const dataSource = new typeorm.DataSource(connection);

  // Testing connection
  await dataSource.initialize();

  let sql = getSql(actionParameters.connection.type);

  // Assigning variable
  // NOTE: For very large dataset it might fail and run out of memory

  const tables = await dataSource.query(sql);
  actionParameters.tables = tables.map((row) => row.table_name);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
