require('dotenv').config();

const fs = require('fs');
const path = require('node:path');

const actionIconsFolder = path.resolve(process.env.PUBLIC_FOLDER, 'action-icons');

const dataSource = require('./connection.js');

async function backup() {
  console.log('Backing up actions');

  await dataSource.initialize();

  const actionsTable = dataSource.getRepository('Actions');

  actionsTable.find({ select: ['id', 'definition'] }).then((actions) => {
    actions.forEach((action) => {
      const folderName = path.resolve('./actions', action.id);
      console.log(folderName);
      fs.mkdirSync(folderName, { recursive: true });
      const definition = JSON.parse(action.definition);
      fs.writeFileSync(path.resolve(folderName, 'metaDataDefinition.json'), JSON.stringify(definition.formDefinition, null, 4));
      fs.writeFileSync(path.resolve(folderName, 'metaData.json'), JSON.stringify(definition.formData, null, 4));
      fs.writeFileSync(path.resolve(folderName, 'properties.json'), JSON.stringify(definition.propertiesDefinition, null, 4));
      fs.writeFileSync(path.resolve(folderName, 'actionScript.js'), definition.script);
      const sourceFileName = path.resolve(actionIconsFolder, `${action.id}.svg`);
      const targetFileName = path.resolve(folderName, `${action.id}.svg`);
      fs.copyFileSync(sourceFileName, targetFileName);
    });
    console.log('Actions backup completed');
  });
}

backup();
