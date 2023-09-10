const { backup, cleanPath } = require("./utils");

//NOTE: cleanPath function prevents access to the files or folders outside files directory

actionParameters.ExecutionResult = SUCCESS;
try {
  const file = cleanPath(actionParameters.file);
  await backup(file, logger, actionParameters.password);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
