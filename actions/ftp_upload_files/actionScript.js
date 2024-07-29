const fs = require('fs');
const path = require('path');
const anymatch = require('anymatch');
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

  await client.access(connection);
  await client.cd(actionParameters.folder);

  const fileName = cleanPath(actionParameters.file);
  const directory = path.dirname(fileName);
  const mask = path.basename(fileName);
  const filesList = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));

  for (const fn of filesList) {
    const file = path.resolve(directory, fn);
    logger.debug(`Uploading: ${fn}`);
    await client.uploadFrom(file, fn);
  }
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
client.close();
return actionParameters.ExecutionResult;
