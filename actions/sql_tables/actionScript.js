// Documentation
// https://typeorm.io/

const typeorm = require("typeorm");

const { getTablesSql } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;

try {
  const connection = {
    name: "sql_data",
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

  let sql = getTablesSql(actionParameters.connection.type);

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
