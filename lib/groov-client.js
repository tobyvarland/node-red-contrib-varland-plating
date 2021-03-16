/** References. */
const { execSync } = require("child_process");
const GroovVariable = require("./groov-variable");

/**
 * Creates an instance of GroovClient.
 * 
 * @param {object} config Configuration for client.
 * @param {string} config.apiKey API key for PAC Control REST API.
 * @param {string} [config.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
function GroovClient(config) {
  this.apiKey = config.apiKey;
  this.hostname = (("hostname" in config) ? config.hostname : "localhost");
}

/**
 * Synchronously executes CURL command and parses stdout as JSON.
 * 
 * @param {string} cmd CURL command to execute.
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.curl = function(cmd) {
  try {
    return JSON.parse(execSync(cmd, {stdio: ['pipe', 'pipe', 'ignore']}).toString());
  } catch (error) {
    return null;
  }
}

/**
 * Formats CURL command for GET request and passes command to execution function.
 * 
 * @param {string} endpoint API endpoint for GET request.
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.get = function(endpoint) {
  const cmd = `curl -k -X GET "https://${this.hostname}/pac${endpoint}" -H "accept: application/json" -H "apiKey: ${this.apiKey}"`;
  return this.curl(cmd);
}

/**
 * Formats CURL command for POST request and passes command to execution function.
 * 
 * Data to be POSTed is stringified and then apostrophe characters are escaped
 * as necessary for inclusion in the CURL command.
 * 
 * @param {string} endpoint API endpoint for GET request.
 * @param {object} data JSON object to be POSTed to API.
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.post = function(endpoint, data) {
  const cmd = `curl -k --data-raw '${JSON.stringify(data).replace("'", "'\\''")}' -X POST "https://${this.hostname}/pac${endpoint}" -H 'Content-Type: application/json' -H "accept: application/json" -H "apiKey: ${this.apiKey}"`;
  return this.curl(cmd);
}

/**
 * Retrieves device details for controller described by hostname.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getDevice = function() {
  return this.get("/device");
}

/**
 * Retrieves strategy details for controller described by hostname.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getStrategy = function() {
  return this.get("/device/strategy");
}

/**
 * Retrieves list of all int32 variables and values.
 * 
 * Converts values to native boolean type for boolean integers.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getIntegers = function() {
  let values = this.get("/device/strategy/vars/int32s");
  values.forEach(element => {
    const variable = new GroovVariable(element.name);
    if (variable.isBoolean) {
      element.value = (element.value != 0);
    }
  })
  return values;
}

/**
 * Retrieves list of all float variables and values.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getFloats = function() {
  return this.get("/device/strategy/vars/floats");
}

/**
 * Retrieves list of all string variables and values.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getStrings = function() {
  return this.get("/device/strategy/vars/strings");
}

/**
 * Retrieves list of all analog inputs and values in engineering units.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getAnalogInputs = function() {
  return this.get("/device/strategy/ios/analogInputs");
}

/**
 * Retrieves list of all analog outputs and values in engineering units.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getAnalogOutputs = function() {
  return this.get("/device/strategy/ios/analogOutputs");
}

/**
 * Retrieves list of all digital inputs and states.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getDigitalInputs = function() {
  return this.get("/device/strategy/ios/digitalInputs");
}

/**
 * Retrieves list of all digital outputs and states.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getDigitalOutputs = function() {
  return this.get("/device/strategy/ios/digitalOutputs");
}

/**
 * Retrieves list of all int32 tables.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
 GroovClient.prototype.getIntegerTables = function() {
  return this.get("/device/strategy/tables/int32s");
}

/**
 * Retrieves list of all float tables.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getFloatTables = function() {
  return this.get("/device/strategy/tables/floats");
}

/**
 * Retrieves list of all string tables.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getStringTables = function() {
  return this.get("/device/strategy/tables/strings");
}

/**
 * Retrieves list of all up timers and values.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getUpTimers = function() {
  return this.get("/device/strategy/vars/upTimers");
}

/**
 * Retrieves list of all down timers and values.
 * 
 * @returns {(object|null)} Parsed JSON object or null on error.
 */
GroovClient.prototype.getDownTimers = function() {
  return this.get("/device/strategy/vars/downTimers");
}

/**
 * Retrieves value of specific integer variable.
 * 
 * Converts value to native boolean type for boolean integers.
 * 
 * @param {string} name Variable name.
 * @returns {(number|boolean|null)} Variable value or null on error.
 */
GroovClient.prototype.getInteger = function(name) {
  try {
    let value = this.get(`/device/strategy/vars/int32s/${name}`).value;
    const variable = new GroovVariable(name);
    if (variable.isBoolean) value = (value != 0);
    return value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific float variable.
 * 
 * @param {string} name Variable name.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getFloat = function(name) {
  try {
    return this.get(`/device/strategy/vars/floats/${name}`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific string variable.
 * 
 * @param {string} name Variable name.
 * @returns {(string|null)} Variable value or null on error.
 */
GroovClient.prototype.getString = function(name) {
  try {
    return this.get(`/device/strategy/vars/strings/${name}`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific analog input.
 * 
 * @param {string} name Variable name.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getAnalogInput = function(name) {
  try {
    return this.get(`/device/strategy/ios/analogInputs/${name}/eu`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific analog output.
 * 
 * @param {string} name Variable name.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getAnalogOutput = function(name) {
  try {
    return this.get(`/device/strategy/ios/analogOutputs/${name}/eu`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific digital input.
 * 
 * @param {string} name Variable name.
 * @returns {(boolean|null)} Variable value or null on error.
 */
GroovClient.prototype.getDigitalInput = function(name) {
  try {
    return this.get(`/device/strategy/ios/digitalInputs/${name}/state`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific digital output.
 * 
 * @param {string} name Variable name.
 * @returns {(boolean|null)} Variable value or null on error.
 */
GroovClient.prototype.getDigitalOutput = function(name) {
  try {
    return this.get(`/device/strategy/ios/digitalOutputs/${name}/state`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves array of values in integer table.
 * 
 * Converts values to native boolean type for boolean tables.
 * 
 * @param {string} name Variable name.
 * @returns {(number[]|boolean[]|null)} Table elements or null on error.
 */
GroovClient.prototype.getIntegerTable = function(name) {
  try {
    let values = this.get(`/device/strategy/tables/int32s/${name}`);
    const variable = new GroovVariable(name);
    if (variable.isBoolean) {
      for (let i = 0; i < values.length; i++) {
        values[i] = (values[i] != 0);
      }
    }
    return values;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves array of values in float table.
 * 
 * @param {string} name Variable name.
 * @returns {(number[]|null)} Table elements or null on error.
 */
GroovClient.prototype.getFloatTable = function(name) {
  try {
    return this.get(`/device/strategy/tables/floats/${name}`);
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves array of values in string table.
 * 
 * @param {string} name Variable name.
 * @returns {(string[]|null)} Table elements or null on error.
 */
GroovClient.prototype.getStringTable = function(name) {
  try {
    return this.get(`/device/strategy/tables/strings/${name}`);
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific integer table index.
 * 
 * Converts value to native boolean type for boolean integers.
 * 
 * @param {string} name Variable name.
 * @param {number} index Table index.
 * @returns {(number|boolean|null)} Variable value or null on error.
 */
GroovClient.prototype.getIntegerTableIndex = function(name, index) {
  try {
    let value = this.get(`/device/strategy/tables/int32s/${name}/${index}`).value;
    const variable = new GroovVariable(name);
    if (variable.isBoolean) value = (value != 0);
    return value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific float table index.
 * 
 * @param {string} name Variable name.
 * @param {number} index Table index.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getFloatTableIndex = function(name, index) {
  try {
    return this.get(`/device/strategy/tables/floats/${name}/${index}`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific string table index.
 * 
 * @param {string} name Variable name.
 * @param {number} index Table index.
 * @returns {(string|null)} Variable value or null on error.
 */
GroovClient.prototype.getStringTableIndex = function(name, index) {
  try {
    return this.get(`/device/strategy/tables/strings/${name}/${index}`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific up timer variable.
 * 
 * @param {string} name Variable name.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getUpTimer = function(name) {
  try {
    return this.get(`/device/strategy/vars/upTimers/${name}/value`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves value of specific down timer variable.
 * 
 * @param {string} name Variable name.
 * @returns {(number|null)} Variable value or null on error.
 */
GroovClient.prototype.getDownTimer = function(name) {
  try {
    return this.get(`/device/strategy/vars/downTimers/${name}/value`).value;
  } catch (err) {
    return null;
  }
}

/**
 * Sets value of specific integer variable.
 * 
 * Converts boolean to integer using true = 1, false = 0.
 * 
 * @param {string} name Variable name.
 * @param {number|boolean} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setInteger = function(name, value) {
  try {
    if (typeof value == "boolean") value = (value ? 1 : 0);
    return (this.post(`/device/strategy/vars/int32s/${name}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific float variable.
 * 
 * @param {string} name Variable name.
 * @param {number} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setFloat = function(name, value) {
  try {
    return (this.post(`/device/strategy/vars/floats/${name}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific string variable.
 * 
 * @param {string} name Variable name.
 * @param {string} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setString = function(name, value) {
  try {
    return (this.post(`/device/strategy/vars/strings/${name}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific analog output.
 * 
 * @param {string} name Variable name.
 * @param {number} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setAnalogOutput = function(name, value) {
  try {
    return (this.post(`/device/strategy/ios/analogOutputs/${name}/eu`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific digital output.
 * 
 * @param {string} name Variable name.
 * @param {number} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setDigitalOutput = function(name, value) {
  try {
    return (this.post(`/device/strategy/ios/digitalOutputs/${name}/state`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sends array to specific integer table.
 * 
 * Converts boolean to integer using true = 1, false = 0.
 * 
 * @param {string} name Table name.
 * @param {number[]} value Table values.
 * @param {number} [startIndex=0] Starting index for value assignment.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setIntegerTable = function(name, value, startIndex = 0) {
  try {
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] == "boolean") value[i] = (value[i] ? 1 : 0);
    }
    return (this.post(`/device/strategy/tables/int32s/${name}?startIndex=${startIndex}`, value).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sends array to specific float table.
 * 
 * @param {string} name Table name.
 * @param {number[]} value Table values.
 * @param {number} [startIndex=0] Starting index for value assignment.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setFloatTable = function(name, value, startIndex = 0) {
  try {
    return (this.post(`/device/strategy/tables/floats/${name}?startIndex=${startIndex}`, value).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sends array to specific string table.
 * 
 * @param {string} name Table name.
 * @param {string[]} value Table values.
 * @param {number} [startIndex=0] Starting index for value assignment.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setStringTable = function(name, value, startIndex = 0) {
  try {
    return (this.post(`/device/strategy/tables/strings/${name}?startIndex=${startIndex}`, value).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific integer table index.
 * 
 * Converts boolean to integer using true = 1, false = 0.
 * 
 * @param {string} name Table name.
 * @param {number} index Table index.
 * @param {number|boolean} value Element value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setIntegerTableIndex = function(name, index, value) {
  try {
    if (typeof value == "boolean") value = (value ? 1 : 0);
    return (this.post(`/device/strategy/tables/int32s/${name}/${index}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific float table index.
 * 
 * @param {string} name Table name.
 * @param {number} index Table index.
 * @param {number} value Element value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setFloatTableIndex = function(name, index, value) {
  try {
    return (this.post(`/device/strategy/tables/floats/${name}/${index}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Sets value of specific string table index.
 * 
 * @param {string} name Table name.
 * @param {number} index Table index.
 * @param {string} value Element value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setStringTableIndex = function(name, index, value) {
  try {
    return (this.post(`/device/strategy/tables/strings/${name}/${index}`, {"value": value}).errorCode == 0);
  } catch (err) {
    return false;
  }
}

/**
 * Retrieves variable value based on variable type parsed from name.
 * 
 * @param {string} name Variable name.
 * @returns {(number|number[]|string|string[]|boolean|null)} Variable value or null on error.
 */
GroovClient.prototype.getVariable = function(name) {
  const variable = new GroovVariable(name);
  if (variable.nameValid) {
    switch (variable.type) {
      case "analog_input":
        return this.getAnalogInput(name);
      case "analog_output":
        return this.getAnalogOutput(name);
      case "digital_input":
        return this.getDigitalInput(name);
      case "digital_output":
        return this.getDigitalOutput(name);
      case "down_timer":
        return this.getDownTimer(name);
      case "float":
        return this.getFloat(name);
      case "float_table":
        return this.getFloatTable(name);
      case "int32":
        return this.getInteger(name);
      case "int32_table":
        return this.getIntegerTable(name);
      case "string":
        return this.getString(name);
      case "string_table":
        return this.getStringTable(name);
      case "up_timer":
        return this.getUpTimer(name);
      default:
        return null;
    }
  } else {
    return null;
  }
}

/**
 * Sets variable value based on variable type parsed from name.
 * 
 * @param {string} name Variable name.
 * @param {(number|number[]|string|string[]|boolean)} value Variable value.
 * @returns {boolean} True on success, false on error.
 */
GroovClient.prototype.setVariable = function(name, value) {
  let variable = new GroovVariable(name);
  if (variable.nameValid) {
    switch (variable.type) {
      case "analog_output":
        return this.setAnalogOutput(name, value);
      case "digital_output":
        return this.setDigitalOutput(name, value);
      case "float":
        return this.setFloat(name, value);
      case "float_table":
        return this.setFloatTable(name, value);
      case "int32":
        return this.setInteger(name, value);
      case "int32_table":
        return this.setIntegerTable(name, value);
      case "string":
        return this.setString(name, value);
      case "string_table":
        return this.setStringTable(name, value);
      default:
        return null;
    }
  } else {
    return null;
  }
}

/** Export class. */
module.exports = GroovClient