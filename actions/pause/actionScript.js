const dayjs = require("dayjs");
const { setTimeout } = require("timers/promises");
actionParameters.ExecutionResult = SUCCESS;

try {
  let buffer = actionParameters.Pause.split(":");
  let hours = parseInt(buffer[0]);
  let minutes = parseInt(buffer[1]);
  let seconds = parseInt(buffer[2]);

  const startDateTime = new Date();
  startDateTime.setHours(startDateTime.getHours() + hours);
  startDateTime.setMinutes(startDateTime.getMinutes() + minutes);
  startDateTime.setSeconds(startDateTime.getSeconds() + seconds);

  logger.info(`Waiting until: ${dayjs(startDateTime).toISOString()}`);
  let now = new Date();
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
  } while (now < startDateTime);
  logger.info(`Current time: ${dayjs(now).toISOString()}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;