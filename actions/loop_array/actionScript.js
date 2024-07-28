const fs = require("fs");

actionParameters.ExecutionResult = SUCCESS;
try {
  const loopArray = actionParameters.data;

  if (!Array.isArray(loopArray)) throw new Error("Loop Data is not array");

  actionParameters.valuesCount = loopArray.length;
  if (actionParameters.valuesCount === 0) throw new Error("Loop Data array is empty");

  const loopInfo = await getLoopInfo();
  let loopIndex = 0;
  if (loopInfo.loopStatus === RUNNING) loopIndex = loopInfo.loopIndex + 1;

  if (loopIndex < loopArray.length) {
    await updateLoopInfo(loopIndex);
    actionParameters.value = loopArray[loopIndex];
  } else {
    await resetLoopInfo();
    actionParameters.ExecutionResult = LOOP_END;
  }
  actionParameters.index = loopIndex;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
