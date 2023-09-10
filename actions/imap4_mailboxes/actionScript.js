const Imap = require("node-imap");

// Documentation
// https://www.npmjs.com/package/node-imap

actionParameters.ExecutionResult = SUCCESS;

function getBoxes() {
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

    async function imapReady() {
      const bx = [];
      await imap.getBoxes(async function more(err, boxes, path) {
        if (err) throw err;
        if (!path) path = "";
        for (const key in boxes) {
          if (boxes[key].children) {
            if (boxes[key].attribs.length !== 0) if (boxes[key].attribs[0] !== "NOSELECT") bx.push(path + key);
            await more(undefined, boxes[key].children, path + key + boxes[key].delimiter);
          } else bx.push(path + key);
        }
        if (path === "") {
          imap.end();
          resolve(bx);
        }
      });
    }
  });
  return p;
}

try {
  actionParameters.boxes = await getBoxes();
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}

return actionParameters.ExecutionResult;
