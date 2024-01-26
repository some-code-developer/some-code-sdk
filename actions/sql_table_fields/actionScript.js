// Documentation
// https://typeorm.io/

const typeorm = require("typeorm");

const { getFieldsSql } = require("./utils");

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

  let sql = getFieldsSql(actionParameters.connection.type, actionParameters.table);

  // Assigning variable
  actionParameters.fields = await dataSource.query(sql);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
