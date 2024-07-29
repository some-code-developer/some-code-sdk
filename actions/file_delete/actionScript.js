const fs = require('fs');
const path = require('path');
const anymatch = require('anymatch');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  const fileName = cleanPath(actionParameters.file);
  const directory = path.dirname(fileName);
  const mask = path.basename(fileName);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));
  if (files.length === 0) throw new Error(`File: ${source} does not exists`);
  files.forEach((fn) => {
    const file = path.resolve(directory, fn);
    fs.unlinkSync(file);
    logger.debug(`Deleted: ${file}`);
  });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
