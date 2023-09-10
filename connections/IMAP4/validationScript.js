const Imap = require("node-imap");

// Documentation
// https://www.npmjs.com/package/node-imap

var result = { status: SUCCESS, message: "Success" };

function testConnection() {
  const p = new Promise((resolve, reject) => {
    const parameters = {
      user: connectionParameters.user,
      password: connectionParameters.password,
      host: connectionParameters.host,
      port: connectionParameters.port,
      tls: connectionParameters.usetls,
      autotls: "always",
      tlsOptions: {
        rejectUnauthorized: false,
      },
      authTimeout: 3000,
    };

    const imap4 = new Imap(parameters);

    imap4.once("error", (err) => reject(err));

    imap4.once("ready", () => {
      imap4.end();
      resolve();
    });
    imap4.connect();
  });
  return p;
}

try {
  await testConnection();
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}

return result;
