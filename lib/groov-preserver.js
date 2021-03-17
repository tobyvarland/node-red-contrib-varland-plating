/** References. */
const fs = require("fs");
const GroovVariable = require("./groov-variable");
const GroovClient = require("./groov-client");

/**
 * Creates an instance of GroovPreserver.
 * 
 * @param {object} clientConfig Configuration for client.
 * @param {string} clientConfig.apiKey API key for PAC Control REST API.
 * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
 */
function GroovPreserver(clientConfig) {
  this.groov = new GroovClient(clientConfig);
}

/**
 * @property {string} MISSING_VARIABLES_TABLE_VARIABLE Name of table storing names of variables not able to be restored.
 * @property {string} MISSING_VARIABLES_FLAG_VARIABLE Name of flag to set when not able to restore a variable.
 * @property {string} STATUS_VARIABLE Name of recipe system status variable.
 */
GroovPreserver.MISSING_VARIABLES_TABLE_VARIABLE = "st_Recipes_MissingVariablesError_Variables";
GroovPreserver.MISSING_VARIABLES_FLAG_VARIABLE = "b_Recipes_MissingVariablesError";
GroovPreserver.STATUS_VARIABLE = "hi_Recipes_Status";
GroovPreserver.RECIPE_STATUSES = {
  restoreNeededAfterDownload: 0,
  restoreInProcess: 1,
  saveNeeded: 2,
  saveInProcess: 3,
  saveFinished: 4,
  saveDelayed: 5
}

/**
 * If startup finished, saves recipe variables to files. If startup not finished,
 * restores variables from files and sets finished flags.
 */
GroovPreserver.prototype.process = function() {
  let status = this.groov.getInteger(GroovPreserver.STATUS_VARIABLE);
  if (status == GroovPreserver.RECIPE_STATUSES.saveNeeded) {
    this.saveData();
  } else if (status == GroovPreserver.RECIPE_STATUSES.restoreNeededAfterDownload) {
    this.restoreData();
  }
}

/**
 * Restores recipe data from backup files in local filesystem.
 */
GroovPreserver.prototype.restoreData = function() {
  this.groov.setInteger(GroovPreserver.STATUS_VARIABLE, GroovPreserver.RECIPE_STATUSES.restoreInProcess);
  this.missingVariables = [];
  this.restoreVariables(this.groov.getIntegers());
  this.restoreVariables(this.groov.getFloats());
  this.restoreVariables(this.groov.getStrings());
  this.restoreVariables(this.groov.getIntegerTables());
  this.restoreVariables(this.groov.getFloatTables());
  this.restoreVariables(this.groov.getStringTables());
  if (this.missingVariables.length > 0) {
    this.groov.setVariable(GroovPreserver.MISSING_VARIABLES_TABLE_VARIABLE, this.missingVariables);
    this.groov.setVariable(GroovPreserver.MISSING_VARIABLES_FLAG_VARIABLE, true);
  } else {
    this.groov.setInteger(GroovPreserver.STATUS_VARIABLE, GroovPreserver.RECIPE_STATUSES.saveNeeded);
  }
}

/**
 * Restores variables from JSON files in local filesystem.
 * 
 * @param {object[]} variables Variables to restore from backup files.
 * @param {string} notification Flag to set after restore finished.
 */
GroovPreserver.prototype.restoreVariables = function(variables) {
  variables.forEach(element => {
    let variable = new GroovVariable(element.name);
    if (variable.isRecipe) {
      let stat;
      try {
        stat = fs.statSync(variable.recipePath, {
          throwIfNoEntry: false
        });
      } catch (error) {
        stat = undefined;
      }
      if (stat !== undefined) {
        let data = JSON.parse(fs.readFileSync(variable.recipePath).toString());
        this.groov.setVariable(element.name, data[element.name]);
      } else {
        this.missingVariables.push(element.name);
      }
    }
  });
}

/**
 * Saves recipe data to backup files in local filesystem.
 */
GroovPreserver.prototype.saveData = function() {
  this.groov.setInteger(GroovPreserver.STATUS_VARIABLE, GroovPreserver.RECIPE_STATUSES.saveInProcess);
  this.saveVariables(this.groov.getIntegers());
  this.saveVariables(this.groov.getFloats());
  this.saveVariables(this.groov.getStrings());
  this.saveTables(this.groov.getIntegerTables());
  this.saveTables(this.groov.getFloatTables());
  this.saveTables(this.groov.getStringTables());
  this.groov.setInteger(GroovPreserver.STATUS_VARIABLE, GroovPreserver.RECIPE_STATUSES.saveFinished);
}

/**
 * Saves individual variables to JSON files in local filesystem.
 * 
 * @param {object[]} variables Variables to save to backup files.
 */
GroovPreserver.prototype.saveVariables = function(variables) {
  variables.forEach(element => {
    let variable = new GroovVariable(element.name);
    if (variable.isRecipe) {
      let json = {};
      json[element.name] = element.value;
      fs.writeFile(variable.recipePath, JSON.stringify(json), function() {});
    }
  })
}

/**
 * Saves individual tables to JSON files in local filesystem.
 * 
 * @param {object} tables Tables to save to backup files.
 */
GroovPreserver.prototype.saveTables = function(tables) {
  tables.forEach(element => {
    let variable = new GroovVariable(element.name);
    if (variable.isRecipe) {
      let json = {};
      json[element.name] = this.groov.getVariable(element.name);
      fs.writeFile(variable.recipePath, JSON.stringify(json), function() {});
    }
  })
}

/** Export class. */
module.exports = GroovPreserver