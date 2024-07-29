const fs = require("fs");

actionParameters.ExecutionResult = SUCCESS;
try {
  const loopInfo = await getLoopInfo();
  let loopIndex = Number(actionParameters.from);
  if (loopInfo.loopStatus === RUNNING) loopIndex = loopInfo.loopIndex + 1;
  await updateLoopInfo(loopIndex);
  actionParameters.sequence = loopIndex;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
