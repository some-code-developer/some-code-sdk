const ftp = require("basic-ftp");
//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

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

  const localFolder = cleanPath(actionParameters.localFolder);

  await client.access(connection);
  await client.cd(actionParameters.remoteFolder);
  await client.uploadFromDir(localFolder);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
