/** References. */
const os = require("os");
const { exec } = require("child_process");
const GroovVariable = require("./groov-variable");
const GroovClient = require("./groov-client");

/**
 * Creates an instance of GroovLog.
 * 
 * @param {string} name Variable name.
 * @param {object} clientConfig Configuration for client.
 * @param {string} clientConfig.apiKey API key for PAC Control REST API.
 * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
function GroovLog(name, clientConfig) {
  this.groov = new GroovClient(clientConfig);
  this.variable = new GroovVariable(name);
  this.log();
}

/**
 * Retrieves list of integer variables and triggers appropriate logs.
 * 
 * @param {object} clientConfig Configuration for client.
 * @param {string} clientConfig.apiKey API key for PAC Control REST API.
 * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
GroovLog.processLogs = function(clientConfig) {
  const groov = new GroovClient(clientConfig);
  const integers = groov.getIntegers();
  integers.forEach(element => {
    const variable = new GroovVariable(element.name);
    if (variable.isLogTrigger && element.value) {
      const log = new GroovLog(element.name, clientConfig);
    }
  })
}

/**
 * Submits POST request to logging app.
 * 
 * @param {string} data Data to be posted to logging app.
 */
GroovLog.postLog = function(data) {
  let cmd = `curl --form 'log=${data}' --request POST "http://optologs.varland.com/log"`;
  exec(cmd, { stdio: ['ignore', 'ignore', 'ignore']});
}

/**
 * Retrieves log data from controller and sends to logging app.
 */
GroovLog.prototype.log = function() {

  // Retrieve log details from controller.
  const logType = this.groov.getString(this.variable.logDetails.logTypeVariable);
  const variableNames = this.groov.getStringTable(this.variable.logDetails.variableNamesTable);
  const fieldNames = this.groov.getStringTable(this.variable.logDetails.fieldNamesTable);

  // Initialize log object.
  let json = {
    type: logType,
    controller: os.hostname()
  };

  // Retrieve log fields.
  for (let i = 0; i < variableNames.length; i++) {
    json[fieldNames[i]] = this.groov.getVariable(variableNames[i]);
  }

  // Post to logging app.
  GroovLog.postLog(JSON.stringify(json));

  // Reset trigger.
  this.groov.setInteger(this.variable.name, false);

}

/** Export class. */
module.exports = GroovLog