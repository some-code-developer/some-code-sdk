// Documentation
// https://www.npmjs.com/package/redis

const { createClient } = require('redis');

actionParameters.ExecutionResult = SUCCESS;
try {
  let url;
  if (actionParameters.connection.password)
    url = `redis://${actionParameters.connection.username}:${actionParameters.connection.password}@${actionParameters.connection.host}:${actionParameters.connection.port}`;
  else url = `redis://${actionParameters.connection.host}:${actionParameters.connection.port}`;

  const client = createClient({ url });
  await client.connect();
  await client.set(actionParameters.key, actionParameters.value);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
