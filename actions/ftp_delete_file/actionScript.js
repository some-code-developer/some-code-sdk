const fs = require("fs");
const path = require("path");
const anymatch = require("anymatch");
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

  await client.access(connection);

  const remoteFolder = path.dirname(actionParameters.file);

  await client.cd(remoteFolder);

  const mask = path.basename(actionParameters.file);

  const filesList = await client.list();

  for (const fn of filesList)
    if (anymatch(mask, fn.name) && fn.type === 1) {
      logger.debug(`Deleting: ${fn.name}`);
      await client.remove(fn.name);
    }
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
