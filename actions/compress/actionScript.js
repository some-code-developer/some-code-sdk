const fs = require("fs");
const path = require("path");
const sevenBin = require("7zip-bin");
const Seven = require("node-7z");
const anymatch = require("anymatch");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

//NOTE: Calculating path to zip
let pathTo7zip = "";
if (sevenBin.path7za.includes("snapshot")) pathTo7zip = path.basename(sevenBin.path7za);
else pathTo7zip = sevenBin.path7za.replace("app.asar", "app.asar.unpacked");

actionParameters.ExecutionResult = SUCCESS;

function compress(file, path) {
  const p = new Promise((resolve, reject) => {
    const parameters = {
      $bin: pathTo7zip,
      recursive: true,
    };

    if (actionParameters.password) parameters.password = actionParameters.password;

    const sevenProcess = Seven.add(file, path, parameters);

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
  const zipFile = cleanPath(actionParameters.file);
  const filesToCompress = cleanPath(actionParameters.path);

  // Checking if we have something to compress
  const directory = path.dirname(filesToCompress);
  const mask = path.basename(filesToCompress);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));
  if (files.length === 0) throw new Error(`File: ${filesToCompress} does not exists`);

  await compress(zipFile, filesToCompress);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
