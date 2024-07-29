const path = require('path');
const anymatch = require('anymatch');
const ftp = require('basic-ftp');

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

  await client.access(connection);

  const remoteFolder = path.dirname(actionParameters.file);

  await client.cd(remoteFolder);

  const mask = path.basename(actionParameters.file);

  const filesList = await client.list();

  const files = filesList.filter((fn) => anymatch(mask, fn.name) && fn.type === 1);

  if (files.length === 0) throw new Error(`File: ${actionParameters.file} does not exists`);
  logger.debug(`Found: ${files.length} file(s)`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
client.close();

return actionParameters.ExecutionResult;
