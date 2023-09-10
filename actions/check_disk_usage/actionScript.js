const checkDiskSpace = require('check-disk-space').default;
actionParameters.ExecutionResult = SUCCESS;
try {
  diskSpace = await checkDiskSpace(actionParameters.DrivePath);
  diskSpace.size = diskSpace.size / 1024 / 1024;
  diskSpace.free = diskSpace.free / 1024 / 1024;
  diskSpace.usage = diskSpace.size - diskSpace.free;
  actionParameters.Size = diskSpace.size;
  actionParameters.Free = diskSpace.free;
  actionParameters.Usage = diskSpace.usage;
  logger.debug(JSON.stringify(diskSpace, null, 4));
  if (diskSpace.usage > actionParameters.UsageToCheck) throw new Error(`Usage: ${diskSpace.usage} >  ${actionParameters.UsageToCheck}`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
