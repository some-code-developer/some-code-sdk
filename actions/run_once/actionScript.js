const dayjs = require("dayjs");
const { setTimeout } = require("timers/promises");
actionParameters.ExecutionResult = SUCCESS;
try {
  const startDateTime = new Date(actionParameters.startDateTime);
  let now = new Date();
  if (actionParameters.wait === "true") logger.info(`Waiting until: ${dayjs(startDateTime).toISOString()}`);
  let tmp = 0;
  do {
    tmp++;
    // Checking every 10 seconds if user aborted/paused execution
    if (tmp === 10) {
      if (isPaused()) throw new Error("Execution aborted");
      tmp = 0;
    }
    // Every second
    await setTimeout(1000);
    now = new Date();
    if (actionParameters.wait !== "true" && now < startDateTime)
      throw new Error(`Current time: ${dayjs(now).toISOString()} < Start Date Time: ${dayjs(startDateTime).toISOString()}`);
  } while (now < startDateTime);
  logger.info(`Current time: ${dayjs(now).toISOString()}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
