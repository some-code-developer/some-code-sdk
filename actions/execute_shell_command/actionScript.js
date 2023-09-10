const execFileSync = require('child_process').execFileSync;
actionParameters.ExecutionResult = SUCCESS;
try {
  // This action might hung so always specify a timeout
  const parameters = [];
  if (actionParameters.parameters) parameters.push(actionParameters.parameters);
  const stdout = execFileSync(actionParameters.file, parameters, { shell: true, timeout: actionParameters.timeout });
  actionParameters.output = stdout.toString();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
