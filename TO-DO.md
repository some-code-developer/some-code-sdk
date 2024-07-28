Improve test coverage
Add execution message

{
"label": "Execution Message",
"name": "ExecutionMessage",
"variableName": "#SqlScript.ExecutionMessage#",
"propertytype": "variable",
"required": false,
"response": false
},

add
logger.error(e.stack.replace(e.message, ""));
