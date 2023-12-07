const fs = require('fs');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  const folder = cleanPath(actionParameters.folder);
  fs.rmdirSync(folder, { recursive: actionParameters.recursive == 'true' });
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
