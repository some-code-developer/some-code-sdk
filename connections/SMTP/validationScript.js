const nodemailer = require("nodemailer");
var result = { status: SUCCESS, message: "Success" };
try {
  // Documentation
  // http://nodemailer.com

  let smptpConnection = {
    host: connectionParameters.host,
    port: connectionParameters.port,
    secure: connectionParameters.usetls, // true for 465, false for other ports
    auth: {
      user: connectionParameters.user,
      pass: connectionParameters.password,
    },
  };

  let transporter = nodemailer.createTransport(smptpConnection);

  // Testing connection
  await transporter.verify();
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}

return result;
