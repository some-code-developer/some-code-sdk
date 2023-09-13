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

  const remoteFolder = path.dirname(actionParameters.file);

  await client.cd(remoteFolder);

  const localFolder = cleanPath(actionParameters.folder);

  if (!fs.existsSync(localFolder)) fs.mkdirSync(localFolder, { recursive: true });

  const mask = path.basename(actionParameters.file);

  const filesList = await client.list();

  for (const fn of filesList)
    if (anymatch(mask, fn.name) && fn.type === 1) {
      const file = path.resolve(localFolder, fn.name);
      logger.debug(`Downloading: ${fn.name}`);
      await client.downloadTo(file, fn.name);
    }
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
client.close();
return actionParameters.ExecutionResult;
