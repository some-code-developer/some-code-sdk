require('dotenv').config();
const fs = require('fs');
const executeAction = require('../../utils/action_execute.js');

const action = 'xml2json';
const { SUCCESS, ERROR } = require('../../utils/consts.js');
const workflowVariables = {};

describe(`${action} Tests`, () => {
  test('Testing Success', async () => {
    const actionParameters = {
      xml: `<Table>
        <Record>
         <ID>1</ID>
         <Company>James Bond Production</Company>
         <Amount>13</Amount>
        </Record>
        <Record>
         <ID>2</ID>
         <Company>Green Cloud</Company>
         <Amount>14</Amount>
        </Record>
      </Table>`,
    };

    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(SUCCESS);
    expect(typeof actionParameters.json).toBe('string');
  });

  test('Testing Failure - missing everything', async () => {
    const actionParameters = {};
    const result = await executeAction(action, actionParameters, workflowVariables);
    // assert
    expect(result).toBe(ERROR);
  });
});
