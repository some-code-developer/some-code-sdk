// Documentation
// https://typeorm.io/

const typeorm = require('typeorm');
const fs = require('fs');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  if (!actionParameters.sql) throw new Error(`Missing Sql`);

  const connection = {
    name: 'sql_export',
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

  // NOTE: For very large dataset it might fail and run out of memory
  const data = await dataSource.query(sql);

  const file = cleanPath(actionParameters.file);

  let createHeader = !fs.existsSync(file);

  let stream;
  if (actionParameters.append) stream = fs.createWriteStream(file, { flags: 'a' });
  else stream = fs.createWriteStream(file);

  if (data) {
    if (actionParameters.format === 'json') stream.write(JSON.stringify(data, null, 4), 'UTF8');
    else {
      if (createHeader) stream.write(Object.keys(data[0]).join(actionParameters.delimiter) + '\n', 'UTF8');
      for (const row of data) stream.write(Object.values(row).join(actionParameters.delimiter) + '\n', 'UTF8');
    }
  }

  stream.end();
  await dataSource.destroy();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
