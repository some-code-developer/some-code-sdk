const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const anymatch = require("anymatch");

const listFiles = (searchPath, attachments) => {
  const file = cleanPath(searchPath);
  const directory = path.dirname(file);
  const mask = path.basename(file);
  const files = fs.readdirSync(directory).filter((fn) => anymatch(mask, fn));
  files.forEach((filename) => {
    const sourcePath = path.resolve(directory, filename);
    attachments.push({
      filename,
      path: sourcePath,
    });
  });
};

actionParameters.ExecutionResult = SUCCESS;
//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

try {
  // Documentation
  // http://nodemailer.com

  let smptpConnection = {
    host: actionParameters.connection.host,
    port: actionParameters.connection.port,
    secure: actionParameters.connection.usetls, // true for 465, false for other ports
    connectionTimeout: 10000, // 10 seconds
    auth: {
      user: actionParameters.connection.user,
      pass: actionParameters.connection.password,
    },
  };

  let transporter = nodemailer.createTransport(smptpConnection);

  let html = actionParameters.message;

  if (actionParameters.replaceVariables) {
    //replacing workflowVariables first
    for (const key in workflowVariables) html = html.split(key).join(workflowVariables[key]);

    //replacing globalParameters first
    for (const key in workflowParameters) html = html.split(key).join(workflowParameters[key]);
  }

  let message = {
    sender: actionParameters.sender,
    from: actionParameters.from,
    replyTo: actionParameters.replyTo,
    to: actionParameters.to,
    cc: actionParameters.cc,
    bcc: actionParameters.bcc,
    subject: actionParameters.subject, // Subject line
    html, // html body
  };

  // Preparing attachments (This might fail)
  // Example: ["/folder/data.txt"]
  if (actionParameters.attachments) {
    const parsedAttachments = await JSON.parse(actionParameters.attachments);
    let attachments = [];
    parsedAttachments.forEach((searchPath) => listFiles(searchPath, attachments));
    if (attachments.length > 0) message.attachments = attachments;
  }

  // send mail with defined transport object
  let info = await transporter.sendMail(message);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
