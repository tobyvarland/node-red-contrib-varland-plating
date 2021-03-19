/** References. */
const GroovClient = require("./groov-client");

/**
 * Creates an instance of GroovMatcher.
 * 
 * @param {string} variableType Variable type to search.
 * @param {string} nameRegex Regular expression for name matching.
 * @param {object} clientConfig Configuration for client.
 * @param {string} clientConfig.apiKey API key for PAC Control REST API.
 * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
function GroovMatcher(variableType, nameRegex, clientConfig) {
  this.variableType = variableType;
  this.nameRegex = new RegExp(nameRegex);
  this.groov = new GroovClient(clientConfig);
}

/**
 * Retrieve variables, filter for matching names, and return array.
 * 
 * @returns {object[]}
 */
GroovMatcher.prototype.find = function() {
  this.variableList = this.getVariableList();
  this.matches = [];
  this.variableList.forEach(element => {
    if (this.nameRegex.exec(element.name) !== null) {
      this.matches.push(element);
    }
  });
  this.matches.forEach(element => {
    if (!("value" in element)) {
      element.value = this.groov.getVariable(element.name);
    }
    if ("length" in element) {
      delete element.length;
    }
  });
  return this.matches;
}

/**
 * Retrieves variables of given type.
 * 
 * @returns {object[]}
 */
GroovMatcher.prototype.getVariableList = function() {
  switch (this.variableType) {
    case "analog_input":
      return this.groov.getAnalogInputs();
    case "analog_output":
      return this.groov.getAnalogOutputs();
    case "digital_input":
      return this.groov.getDigitalInputs();
    case "digital_output":
      return this.groov.getDigitalOutputs();
    case "down_timer":
      return this.groov.getDownTimers();
    case "float":
      return this.groov.getFloats();
    case "float_table":
      return this.groov.getFloatTables();
    case "int32":
      return this.groov.getIntegers();
    case "int32_table":
      return this.groov.getIntegerTables();
    case "string":
      return this.groov.getStrings();
    case "string_table":
      return this.groov.getStringTables();
    case "up_timer":
      return this.groov.getUpTimers();
  }
}

/** Export class. */
module.exports = GroovMatcher