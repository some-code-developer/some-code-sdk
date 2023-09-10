const ftp = require("basic-ftp");
var result = { status: SUCCESS, message: "Success" };

const client = new ftp.Client();
//client.ftp.verbose = true

try {
  // Documentation
  // https://www.npmjs.com/package/basic-ftp?activeTab=readme

  const connection = {
    host: connectionParameters.host,
    port: Number(connectionParameters.port),
    user: connectionParameters.user,
    password: connectionParameters.password,
    secure: connectionParameters.secure,
  };

  await client.access(connection);

  //console.log(await client.list())
  //console.log(await client.features())
} catch (e) {
  result.status = ERROR;
  result.message = e.message;
}

client.close();

return result;
