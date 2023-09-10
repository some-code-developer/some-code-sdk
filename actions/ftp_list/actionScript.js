const ftp = require("basic-ftp");

actionParameters.ExecutionResult = SUCCESS;
try {
  const client = new ftp.Client();

  const connection = {
    host: actionParameters.connection.host,
    port: Number(actionParameters.connection.port),
    user: actionParameters.connection.user,
    password: actionParameters.connection.password,
    secure: actionParameters.connection.secure,
  };

  await client.access(connection);
  await client.cd(actionParameters.folder);
  actionParameters.list = await client.list();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
