/** References. */
const fs = require("fs")
const GroovVariable = require("./groov-variable")
const GroovClient = require("./groov-client")

/** @class GroovPreserver used for maintaining variable values across downloads. */
class GroovPreserver {

  /**
   * @property {string} FINISHED_VARIABLE Name of variable indicating startup restore process is finished.
   * @property {string} FINISHED_INTEGERS_VARIABLE Name of variable to set to indicate restoration of integers is finished.
   * @property {string} FINISHED_FLOATS_VARIABLE Name of variable to set to indicate restoration of floats is finished.
   * @property {string} FINISHED_STRINGS_VARIABLE Name of variable to set to indicate restoration of strings is finished.
   * @property {string} FINISHED_INTEGER_TABLES_VARIABLE Name of variable to set to indicate restoration of integer tables is finished.
   * @property {string} FINISHED_FLOAT_TABLES_VARIABLE Name of variable to set to indicate restoration of float tables is finished.
   * @property {string} FINISHED_STRING_TABLES_VARIABLE Name of variable to set to indicate restoration of string tables is finished.
   */
  static FINISHED_VARIABLE = "b_StartupRecipes_Finished"
  static FINISHED_INTEGERS_VARIABLE = "b_StartupRecipes_FinishedIntegers"
  static FINISHED_FLOATS_VARIABLE = "b_StartupRecipes_FinishedFloats"
  static FINISHED_STRINGS_VARIABLE = "b_StartupRecipes_FinishedStrings"
  static FINISHED_INTEGER_TABLES_VARIABLE = "b_StartupRecipes_FinishedIntegerTables"
  static FINISHED_FLOAT_TABLES_VARIABLE = "b_StartupRecipes_FinishedFloatTables"
  static FINISHED_STRING_TABLES_VARIABLE = "b_StartupRecipes_FinishedStringTables"

  /**
   * Creates an instance of GroovPreserver.
   * 
   * @param {object} clientConfig Configuration for client.
   * @param {string} clientConfig.apiKey API key for PAC Control REST API.
   * @param {string} [clientConfig.hostname] Host name for PAC Control REST API. Defaults to localhost.
   */
  constructor(clientConfig) {
    this.groov = new GroovClient(clientConfig)
  }

  /**
   * If startup finished, saves recipe variables to files. If startup not finished,
   * restores variables from files and sets finished flags.
   */
  process() {
    this.startupFinished = this.groov.getInteger(GroovPreserver.FINISHED_VARIABLE)
    if (this.startupFinished) {
      this.saveData()
    } else {
      this.restoreData()
    }
  }

  /**
   * Restores recipe data from backup files in local filesystem.
   */
  restoreData() {
    this.restoreVariables(this.groov.getIntegers(), GroovPreserver.FINISHED_INTEGERS_VARIABLE)
    this.restoreVariables(this.groov.getFloats(), GroovPreserver.FINISHED_FLOATS_VARIABLE)
    this.restoreVariables(this.groov.getStrings(), GroovPreserver.FINISHED_STRINGS_VARIABLE)
    this.restoreVariables(this.groov.getIntegerTables(), GroovPreserver.FINISHED_INTEGER_TABLES_VARIABLE)
    this.restoreVariables(this.groov.getFloatTables(), GroovPreserver.FINISHED_FLOAT_TABLES_VARIABLE)
    this.restoreVariables(this.groov.getStringTables(), GroovPreserver.FINISHED_STRING_TABLES_VARIABLE)
  }

  /**
   * Restores variables from JSON files in local filesystem.
   * 
   * @param {object[]} variables Variables to restore from backup files.
   * @param {string} notification Flag to set after restore finished.
   */
  restoreVariables(variables, notification) {
    variables.forEach(element => {
      let variable = new GroovVariable(element.name)
      if (variable.isRecipe) {
        let stat = fs.statSync(variable.recipePath, {
          throwIfNoEntry: false
        })
        if (stat !== undefined) {
          let data = JSON.parse(fs.readFileSync(variable.recipePath).toString())
          this.groov.setVariable(element.name, data[element.name])
        }
      }
    })
    this.groov.setVariable(notification, true)
  }

  /**
   * Saves recipe data to backup files in local filesystem.
   */
  saveData() {
    this.saveVariables(this.groov.getIntegers())
    this.saveVariables(this.groov.getFloats())
    this.saveVariables(this.groov.getStrings())
    this.saveTables(this.groov.getIntegerTables())
    this.saveTables(this.groov.getFloatTables())
    this.saveTables(this.groov.getStringTables())
  }

  /**
   * Saves individual variables to JSON files in local filesystem.
   * 
   * @param {object[]} variables Variables to save to backup files.
   */
  saveVariables(variables) {
    variables.forEach(element => {
      let variable = new GroovVariable(element.name)
      if (variable.isRecipe) {
        let json = {}
        json[element.name] = element.value
        fs.writeFile(variable.recipePath, JSON.stringify(json), function() {})
      }
    })
  }

  /**
   * Saves individual tables to JSON files in local filesystem.
   * 
   * @param {object} tables Tables to save to backup files.
   */
  saveTables(tables) {
    tables.forEach(element => {
      let variable = new GroovVariable(element.name)
      if (variable.isRecipe) {
        let json = {}
        json[element.name] = this.groov.getVariable(element.name)
        fs.writeFile(variable.recipePath, JSON.stringify(json), function() {})
      }
    })
  }

}

/** Export class. */
module.exports = GroovPreserver