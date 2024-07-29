const fs = require("fs");
const path = require("path");
const anymatch = require("anymatch");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);
  const directory = path.dirname(file);
  const mask = path.basename(file);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));

  if (files.length > 0) actionParameters.ExecutionResult = SUCCESS;
  else throw new Error(`File: ${file} does not exists`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
