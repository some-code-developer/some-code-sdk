const fs = require('fs');
const path = require('path');
const anymatch = require('anymatch');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  const source = cleanPath(actionParameters.source);
  const target = cleanPath(actionParameters.target);

  const directory = path.dirname(source);
  const mask = path.basename(source);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));
  if (files.length === 0) throw new Error(`File: ${source} does not exists`);
  if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
  files.forEach((fn) => {
    const sourceFile = path.resolve(directory, fn);
    const targetFile = path.resolve(target, fn);
    fs.copyFileSync(sourceFile, targetFile);
    logger.debug(`Copied: ${sourceFile} to ${sourceFile}`);
  });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
