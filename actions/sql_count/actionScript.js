// Documentation
// https://typeorm.io/

const typeorm = require('typeorm');
actionParameters.ExecutionResult = SUCCESS;
try {
  if (!actionParameters.sql) throw new Error(`Missing Sql`);

  const connection = {
    name: 'sql_count',
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

  let sql = actionParameters.sql;

  if (actionParameters.replaceVariables) {
    //replacing workflowVariables first
    for (const key in workflowVariables) sql = sql.split(key).join(workflowVariables[key]);

    //replacing globalParameters first
    for (const key in workflowParameters) sql = sql.split(key).join(workflowParameters[key]);
  }

  // Getting record count
  const rows = await dataSource.query(sql);
  const row = rows[0];
  const count = row[Object.keys(row)[0]];

  // Assigning variable
  actionParameters.count = count;

  await dataSource.destroy();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}

return actionParameters.ExecutionResult;
