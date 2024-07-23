const Imap = require("node-imap");
const path = require("path");
const fs = require("fs");
const crypto = require("node:crypto");
const { Base64Decode } = require("base64-stream");

// Documentation
// https://www.npmjs.com/package/node-imap

// This is a very complex action so it might have errors

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;

function checkRegExpr(enabled, expr) {
  if (!enabled) return () => true;
  const regExp = new RegExp(expr);
  return (value) => regExp.test(value);
}

function toUpper(thing) {
  return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
}

// Message filters
const checkSenderFilter = checkRegExpr(actionParameters.checkSender == "true", actionParameters.senderRegx);
const checkSubjectFilter = checkRegExpr(actionParameters.checkSubject == "true", actionParameters.subjectRegx);
const checkRecipientFilter = checkRegExpr(actionParameters.checkRecipient == "true", actionParameters.recipientRegx);
const checkAttachmentsFilter = checkRegExpr(actionParameters.checkAttachment == "true", actionParameters.attachmentRegx);

// Filter for saving Attachments
const checkAttachmentFilter = checkRegExpr(actionParameters.saveAttachmentUseRegEx == "true", actionParameters.saveAttachmentRegEx);

function checkFilter(sender, subject, recipient, attachments) {
  logger.error(`Tests1: ` + (actionParameters.checkAttachment == "false"));
  //logger.error(`Tests2: ` + attachments.some((attachment) => checkAttachmentsFilter(attachment.params.filename)))
  //logger.error(`Tests3: ` + attachments.some((attachment) => attachment.params && checkAttachmentsFilter(attachment.params.filename)))

  return (
    checkSenderFilter(sender) &&
    checkSubjectFilter(subject) &&
    checkRecipientFilter(recipient) &&
    (attachments.length === 0 ||
      actionParameters.checkAttachment == "false" ||
      attachments.some((attachment) => attachment.params && checkAttachmentsFilter(attachment.params.filename)))
  );
}

function buildAttMessageFunction(attachment) {
  const filename = attachment.params.name;
  const { encoding } = attachment;
  const { id } = attachment;
  const { attachmentFolder } = attachment;

  return function (msg, seqno) {
    msg.on("body", (stream, info) => {
      // writing attachent
      // Create a write stream so that we can stream the attachment to file;
      logger.debug(`${id} - Saving attachment: ${filename}, ${JSON.stringify(info)}`);
      // Creating directory
      const directory = path.resolve(attachmentFolder, id);
      if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
      const actualfile = path.resolve(directory, filename);
      const writeStream = fs.createWriteStream(actualfile);
      writeStream.on("finish", () => logger.debug(`${id} - Done saving file ${filename}`));
      // stream.pipe(writeStream); this would write base64 data to the file.
      // so we decode during streaming using
      if (toUpper(encoding) === "BASE64") {
        // the stream is base64 encoded, so here the stream is decode on the fly and piped to the write stream (file)
        stream.pipe(new Base64Decode()).pipe(writeStream);
      } else {
        // here we have none or some other decoding streamed directly to the file which renders it useless probably
        stream.pipe(writeStream);
      }
    });
  };
}

function findAttachmentParts(struct, attachments) {
  attachments = attachments || [];
  for (let i = 0, len = struct.length; i < len; ++i) {
    if (Array.isArray(struct[i])) {
      findAttachmentParts(struct[i], attachments);
    } else if (struct[i].disposition && ["INLINE", "ATTACHMENT"].indexOf(toUpper(struct[i].disposition.type)) > -1) {
      attachments.push(struct[i]);
    }
  }
  return attachments;
}

function getMessage() {
  const p = new Promise((resolve, reject) => {
    const parameters = {
      user: actionParameters.connection.user,
      password: actionParameters.connection.password,
      host: actionParameters.connection.host,
      port: actionParameters.connection.port,
      tls: actionParameters.connection.usetls,
      autotls: "always",
      tlsOptions: {
        rejectUnauthorized: false,
      },
      authTimeout: 3000,
    };

    const imap = new Imap(parameters);

    imap.once("error", (err) => reject(err));

    imap.once("ready", () => imapReady());
    imap.connect();

    function failed(message) {
      imap.end();
      reject(new Error(message));
    }

    function imapReady() {
      function saveMessage(uid, messageId, prefix) {
        const f = imap.fetch(uid, {
          bodies: [""],
          struct: true,
        });
        f.on("message", (msg, seqno) => {
          msg.on("body", (stream, info) => {
            const messageFolder = cleanPath(actionParameters.messageFolder);
            const filename = path.resolve(messageFolder, `msg-${messageId}.eml`);
            const writeStream = fs.createWriteStream(filename);
            logger.debug(`${prefix} Saving message into ${filename}`);
            writeStream.on("finish", () => logger.debug(`${messageId} - Done writing message to file ${filename}`));
            stream.pipe(writeStream);
          });
        });
      }

      function finishMessage(action, uid, actionBox, prefix) {
        if (action === "MAR") {
          imap.addFlags(uid, ["\\Seen"], (err) => {
            if (err) return failed(`${prefix} Failed to mark as read! ${err}`);
            else logger.debug(`${prefix} Marked as read!`);
          });
        }

        if (action === "DM") {
          imap.addFlags(uid, ["\\Deleted"], (err) => {
            if (err) return failed(`${prefix} Failed to mark as deleted! ${err}`);
            else logger.debug(`${prefix} Marked as deleted!`);
          });
        }

        if (action === "MTF") {
          imap.move(uid, actionBox, (err) => {
            if (err) return failed(`${prefix} Failed to move to folder: ${actionBox}, ${err}`);
            else logger.debug(`${prefix} Moved to folder: ${actionBox}`);
          });
        }
      }

      function processAttachments(prefix, attachments, attrs, messageId) {
        logger.debug(`${prefix} Has attachments: #${attachments.length}`);
        for (let i = 0, len = attachments.length; i < len; ++i) {
          const attachment = attachments[i];
          // Save attachments selected
          if (actionParameters.saveAttachments == "true" && checkAttachmentFilter(attachment.params.filename)) {
            /* This is how each attachment looks like {
            partID: '2',
            type: 'application',
            subtype: 'octet-stream',
            params: { name: 'file-name.ext' },
            id: null,
            description: null,
            encoding: 'BASE64',
            size: 44952,
            md5: null,
            disposition: { type: 'ATTACHMENT', params: { filename: 'file-name.ext' } },
            language: null
          }
        */
            if (attachment.params.name) {
              // some parameters have no names
              logger.debug(`${prefix} Fetching attachment ${attachment.params.name}`);
              const f = imap.fetch(attrs.uid, {
                // do not use imap.seq.fetch here
                bodies: [attachment.partID],
                struct: true,
              });
              // build function to process attachment message
              attachment.id = messageId;
              const attachmentFolder = cleanPath(actionParameters.attachmentFolder);
              attachment.attachmentFolder = attachmentFolder;
              f.on("message", buildAttMessageFunction(attachment));
            }
          }
        }
      }

      imap.openBox(actionParameters.box, false, (err, box) => {
        if (err) return failed(`Failed to open ${actionParameters.box}, ${err} `);

        // Search email
        imap.search([actionParameters.what], (err, results) => {
          if (err) return failed(`Search failed ${actionParameters.what}, ${err}`);

          if (results.length === 0) return failed(`Nothing to fetch`);

          const checkMaxMessages = actionParameters.checkMaxMessages == "true";
          const maxMessages = Number(actionParameters.maxMessages);

          if (checkMaxMessages && maxMessages < results.length) results.length = maxMessages;

          logger.debug(`Messages to fetch: ${results.length}`);

          // Fetch results
          const f = imap.fetch(results, {
            bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)"],
            struct: true,
          });

          f.on("message", (msg, seqno) => {
            const messageId = crypto.randomUUID();
            logger.debug(`${messageId} - Message #${seqno}`);
            const prefix = `${messageId} - ${seqno}`;
            msg.on("body", (stream, info) => {
              let buffer = "";
              stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));

              stream.once("end", () => {
                const headers = Imap.parseHeader(buffer);
                const recipient = headers.to.toString();
                const sender = headers.from.toString();
                const subject = headers.subject.toString();
                const date = headers.date.toString();
                const body = buffer.toString();
                // what if message has no attributes?
                msg.once("attributes", (attrs) => {
                  let attachments = [];
                  attachments = findAttachmentParts(attrs.struct, attachments);

                  logger.error(`Start`);

                  // Checking filters
                  if (!checkFilter(sender, subject, recipient, attachments)) return;

                  logger.error(`End`);

                  actionParameters.messageId = messageId;
                  actionParameters.seqno = seqno;
                  actionParameters.uid = attrs.uid;
                  actionParameters.recipient = recipient;
                  actionParameters.sender = sender;
                  actionParameters.subject = subject;
                  actionParameters.date = date;
                  actionParameters.body = body;

                  actionParameters.attachmentsCount = attachments.length;

                  // Save messages selected
                  if (actionParameters.saveMessages == "true") saveMessage(attrs.uid, messageId, prefix);

                  // Save Attachments selected
                  if (actionParameters.saveAttachments == "true") processAttachments(prefix, attachments, attrs, messageId);
                  // Completing message processing
                  finishMessage(actionParameters.action, attrs.uid, actionParameters.actionBox, prefix);
                }); // attributes
              }); // stream
            });
            msg.once("end", () => logger.debug(`${prefix} Finished email`));
          });

          f.once("error", (err) => logger.error(`Fetch error: ${err}`));

          f.once("end", () => {
            logger.debug(`Done fetching all messages!`);
            imap.closeBox((err) => {
              if (err) logger.error(`Close error: ${err}`);
              resolve();
              imap.end();
            });
          });
        });
      });

      // Promise end
    }
  });

  return p;
}

try {
  await getMessage();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
