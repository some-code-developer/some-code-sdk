// Documentation
// http://nodemailer.com

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const anymatch = require('anymatch');

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
const { cleanPath } = require('./utils');

try {
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
    for (const key in workflowVariables)
      if (typeof workflowVariables[key] === 'object') {
        for (const childKey in workflowVariables[key]) html = html.split(`${key}.${childKey}`).join(workflowVariables[key][childKey]);
        html = html.split(key).join(JSON.stringify(workflowVariables[key], null, 4));
      } else html = html.split(key).join(workflowVariables[key]);

    //replacing globalParameters
    for (const key in workflowParameters)
      if (typeof workflowParameters[key] === 'object') {
        for (const childKey in workflowParameters[key]) html = html.split(`${key}.${childKey}`).join(workflowParameters[key][childKey]);
        html = html.split(key).join(JSON.stringify(workflowParameters[key], null, 4));
      } else html = html.split(key).join(workflowParameters[key]);
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
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}

return actionParameters.ExecutionResult;
