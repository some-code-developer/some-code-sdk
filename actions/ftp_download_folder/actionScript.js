const ftp = require('basic-ftp');
//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
const client = new ftp.Client();
try {
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
  await client.downloadToDir(localFolder);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.stack.replace(e.message, ''));
  logger.error(e.message);
}
client.close();
return actionParameters.ExecutionResult;
