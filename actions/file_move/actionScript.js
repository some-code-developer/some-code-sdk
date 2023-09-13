const fs = require('fs');
const path = require('path');
const anymatch = require('anymatch');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);
  const folder = cleanPath(actionParameters.folder);
  const directory = path.dirname(file);
  const mask = path.basename(file);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));
  if (files.length === 0) throw new Error(`File: ${source} does not exists`);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  files.forEach((fn) => {
    const sourceFile = path.resolve(directory, fn);
    const targetFile = path.resolve(folder, fn);
    fs.copyFileSync(sourceFile, targetFile);
    fs.unlinkSync(sourceFile);
    logger.debug(`Moved: ${sourceFile} to ${sourceFile}`);
  });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
