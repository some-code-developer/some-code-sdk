const sevenBin = require("7zip-bin");
const Seven = require("node-7z");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

//NOTE: Calculating path to zip
let pathTo7zip = "";
if (sevenBin.path7za.includes("snapshot")) pathTo7zip = path.basename(sevenBin.path7za);
else pathTo7zip = sevenBin.path7za.replace("app.asar", "app.asar.unpacked");

actionParameters.ExecutionResult = SUCCESS;

function decompress() {
  const p = new Promise((resolve, reject) => {
    const parameters = {
      $bin: pathTo7zip,
      noRootDuplication: true,
    };

    // Note:
    // If archive is not password protected password is ignored
    // If archive is password protected but password is not supplied 7zip will hang
    // So we have to supply incorrect 'password' to force it to fail

    if (actionParameters.password) parameters.password = actionParameters.password;
    else parameters.password = "password";

    const file = cleanPath(actionParameters.file);
    const path = cleanPath(actionParameters.path);

    const sevenProcess = Seven.extractFull(file, path, parameters);

    sevenProcess.on("error", (err) => {
      reject(err);
    });

    sevenProcess.on("end", (info) => {
      resolve();
    });
  });

  return p;
}

try {
  await decompress();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
