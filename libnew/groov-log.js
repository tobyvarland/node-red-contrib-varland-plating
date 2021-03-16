/** References. */
const os = require("os")
const { exec } = require("child_process")
const GroovVariable = require("./groov-variable")
const GroovClient = require("./groov-client")

/** @class GroovLog used for processing historic data logs. */
class GroovLog {

  /**
   * Retrieves list of integer variables and triggers appropriate logs.
   * 
   * @param {object} clientConfig Configuration for client.
   * @param {string} clientConfig.apiKey API key for PAC Control REST API.
   * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
   */
  static processLogs(clientConfig) {
    const groov = new GroovClient(clientConfig)
    const integers = groov.getIntegers()
    integers.forEach(element => {
      const variable = new GroovVariable(element.name)
      if (variable.isLogTrigger && element.value) {
        const log = new GroovLog(element.name, clientConfig)
      }
    })
  }

  /**
   * Submits POST request to logging app.
   * 
   * @param {string} data Data to be posted to logging app.
   */
  static postLog(data) {
    let cmd = `curl --form 'log=${data}' --request POST "http://optologs.varland.com/log"`
    exec(cmd, { stdio: ['ignore', 'ignore', 'ignore']})
  }

  /**
   * Creates an instance of GroovLog.
   * 
   * @param {string} name Variable name.
   * @param {object} clientConfig Configuration for client.
   * @param {string} clientConfig.apiKey API key for PAC Control REST API.
   * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
   */
  constructor(name, clientConfig) {
    this.groov = new GroovClient(clientConfig)
    this.variable = new GroovVariable(name)
    this.log()
  }

  /**
   * Retrieves log data from controller and sends to logging app.
   */
  log() {

    // Retrieve log details from controller.
    const logType = this.groov.getString(this.variable.logDetails.logTypeVariable)
    const variableNames = this.groov.getStringTable(this.variable.logDetails.variableNamesTable)
    const fieldNames = this.groov.getStringTable(this.variable.logDetails.fieldNamesTable)

    // Initialize log object.
    let json = {
      type: logType,
      controller: os.hostname()
    }

    // Retrieve log fields.
    for (let i = 0; i < variableNames.length; i++) {
      json[fieldNames[i]] = this.groov.getVariable(variableNames[i])
    }

    // Post to logging app.
    GroovLog.postLog(JSON.stringify(JSON.stringify(json)))

    // Reset trigger.
    this.groov.setInteger(this.variable.name, false)

  }

}

/** Export class. */
module.exports = GroovLog