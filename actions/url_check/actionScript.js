const fetch = require('node-fetch');

actionParameters.ExecutionResult = SUCCESS;
try {
  let url = actionParameters.url;
  const response = await fetch(url, { method: 'HEAD' });
  actionParameters.responseStatus = response.status;
  actionParameters.responseStatusText = response.statusText;
  if (response.status !== 200) throw new Error(response.statusText);
  actionParameters.responseHeaders = response.headers;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
