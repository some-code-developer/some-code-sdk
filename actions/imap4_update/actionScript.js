const Imap = require("node-imap");

// Documentation
// https://www.npmjs.com/package/node-imap

// This is a very complex action so it might have errors

actionParameters.ExecutionResult = SUCCESS;

function updateMessage() {
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
      imap.openBox(actionParameters.box, false, (err, box) => {
        if (err) return failed(`Failed to open ${box} ${err}`);

        if (actionParameters.action === "MAR") {
          imap.addFlags(actionParameters.uid, ["\\Seen"], (err) => {
            if (err) return failed(`Failed to mark as read! ${err}`);
            logger.debug(`Marked as read!`);
            imap.end();
            resolve();
          });
        }

        if (actionParameters.action === "DM") {
          imap.addFlags(actionParameters.uid, ["\\Deleted"], (err) => {
            if (err) return failed(`Failed to mark as deleted! ${err}`);
            logger.debug(`Marked as deleted!`);
            imap.end();
            resolve();
          });
        }

        if (actionParameters.action === "MTF") {
          imap.move(actionParameters.uid, actionParameters.actionBox, (err) => {
            if (err) return failed(`Failed to move to folder: ${actionParameters.actionBox}, ${err}`);
            logger.debug(`Moved to folder: ${actionParameters.actionBox}`);
            imap.end();
            resolve();
          });
        }
      });
    }
  });
  return p;
}

try {
  await updateMessage();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
