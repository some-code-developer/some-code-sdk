require("dotenv").config();

const fs = require("fs");
const path = require("node:path");

const dataSource = require("./connection.js");

async function backup() {
  console.log("Backing up connections");

  await dataSource.initialize();
  const connectionsTable = dataSource.getRepository("Connections");

  let connections = await connectionsTable.find({
    select: ["id", "definition"],
  });

  connections.forEach((connection) => {
    const folderName = path.resolve("./connections", connection.id);

    console.log(folderName);
    fs.mkdirSync(folderName, { recursive: true });
    const definition = JSON.parse(connection.definition);
    fs.writeFileSync(path.resolve(folderName, "metaData.json"), JSON.stringify(definition.definition, null, 4));
    fs.writeFileSync(path.resolve(folderName, "properties.json"), JSON.stringify(definition.properties, null, 4));
    fs.writeFileSync(path.resolve(folderName, "validationScript.js"), definition.script);
  });
  console.log("Connections backup completed");
}

backup();
