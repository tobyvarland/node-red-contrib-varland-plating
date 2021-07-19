/** References. */
const os = require("os");
const InfluxDB = require("influxdb-v2");
const GroovVariable = require("./groov-variable");
const GroovClient = require("./groov-client");

/**
 * Creates an instance of GroovHistorian.
 * 
 * @param {object} influxConfig Configuration for InfluxDB.
 * @param {string} influxConfig.hostname Hostname for InfluxDB server.
 * @param {string} influxConfig.protocol Protocol for InfluxDB server.
 * @param {number} influxConfig.port Port # for InfluxDB server.
 * @param {string} influxConfig.token Access token for InfluxDB server.
 * @param {string} influxConfig.orgID Organization ID for InfluxDB server.
 * @param {string} influxConfig.bucket Bucket for InfluxDB server.
 * @param {string} [influxConfig.variableMeasurement] Measurement name for variables. Defaults to "variables".
 * @param {string} [influxConfig.tableMeasurement] Measurement name for tables. Defaults to "tables".
 * @param {object} clientConfig Configuration for client.
 * @param {string} clientConfig.apiKey API key for PAC Control REST API.
 * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
function GroovHistorian(influxConfig, clientConfig) {
  this.groov = new GroovClient(clientConfig);
  this.influx = new InfluxDB({
    host: influxConfig.hostname,
    protocol: influxConfig.protocol,
    port: influxConfig.port,
    token: influxConfig.token
  });
  this.orgID = influxConfig.orgID;
  this.bucket = influxConfig.bucket;
  this.variableMeasurement = (("variableMeasurement" in influxConfig) ? influxConfig.variableMeasurement : "variables");
  this.tableMeasurement = (("tableMeasurement" in influxConfig) ? influxConfig.tableMeasurement : "tables");
}

/**
 * Logs variables to historian.
 * 
 * @returns {number} Number of points logged to historian.
 */
GroovHistorian.prototype.historize = function() {

  // Initialize array of data points to be logged.
  this.points = [];

  // Find points to be historized.
  this.processVariables(this.groov.getAnalogInputs());
  this.processVariables(this.groov.getAnalogOutputs());
  this.processVariables(this.groov.getDigitalInputs());
  this.processVariables(this.groov.getDigitalOutputs());
  this.processVariables(this.groov.getIntegers());
  this.processVariables(this.groov.getFloats());
  this.processVariables(this.groov.getUpTimers());
  this.processVariables(this.groov.getDownTimers());
  this.processTables(this.groov.getIntegerTables());
  this.processTables(this.groov.getFloatTables());

  // If points found, write to InfluxDB.
  if (this.points.length > 0) {
    this.writePoints();
    this.groov.setInteger("b_Historized", true);
  }

  // Return number of points logged to historian.
  return this.points.length;

}

/**
 * Checks array of tables for historization flag and logs applicable points.
 * 
 * @param {object[]} tables Tables to check.
 */
GroovHistorian.prototype.processTables = function(tables) {
  tables.forEach(element => {
    const variable = new GroovVariable(element.name);
    if (variable.isHistorian) {
      let data = this.groov.getVariable(element.name);
      for (let i = 0, c = data.length; i < c; i++) {
        this.addTableElement(element.name, i, data[i]);
      }
    }
  })
}

/**
 * Checks array of variables for historization flag and logs applicable points.
 * 
 * @param {object[]} variables Variables to check.
 */
GroovHistorian.prototype.processVariables = function(variables) {
  variables.forEach(element => {
    const variable = new GroovVariable(element.name);
    if (variable.isHistorian) {
      this.addVariable(element.name, element.value);
    }
  })
}

/**
 * Writes points to InfluxDB.
 */
GroovHistorian.prototype.writePoints = function() {
  this.influx.write(
    {
      orgID: this.orgID,
      bucket: this.bucket
    },
    this.points
  );
}

/**
 * Adds table element to array of points to be logged.
 * 
 * @param {string} name Table name.
 * @param {number} index Element index.
 * @param {number|boolean} value Element value.
 */
GroovHistorian.prototype.addTableElement = function(name, index, value) {
  
  // Convert boolean value to integer if necessary.
  if (typeof value == "boolean") value = (value ? 1 : 0);

  // Add point to array.
  this.points.push({
    measurement: this.tableMeasurement,
    tags: { name: name, controller: os.hostname() },
    fields: { index: index, value: value }
  });

}

/**
 * Adds variable to array of points to be logged.
 * 
 * @param {string} name Variable name.
 * @param {number|boolean} value Variable value.
 */
GroovHistorian.prototype.addVariable = function(name, value) {
  
  // Convert boolean value to integer if necessary.
  if (typeof value == "boolean") value = (value ? 1 : 0);

  // Add point to array.
  this.points.push({
    measurement: this.variableMeasurement,
    tags: { name: name, controller: os.hostname() },
    fields: { value: value }
  });

}

/** Export class. */
module.exports = GroovHistorian