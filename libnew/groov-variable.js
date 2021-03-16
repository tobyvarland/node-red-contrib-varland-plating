/** References. */
const os = require("os")

/** @class GroovVariable representing a variable defined in PAC Control. */
class GroovVariable {

  /**
   * @property {object} PREFIXES List of valid variable prefixes.
   * @property {string} RECIPE_VARIABLE_PREFIX Special prefix used for recipe variables.
   * @property {string} HISTORIAN_VARIABLE_PREFIX Special prefix used for historian variables.
   * @property {string} VARIABLE_SEPARATOR Separator character used in variable names.
   * @property {object} LOG_TRIGGER_REGEX Regex used to determine if variable is a log trigger.
   * @property {object} VALID_NAME_REGEX Regex used to determing if variable name is valid.
   * @property {string} LOCAL_RECIPE_FOLDER Path to local recipe folder (for recipe variables).
   */
  static PREFIXES = {
    "ai": "analog_input",
    "ao": "analog_output",
    "b": "int32",
    "bt": "int32_table",
    "di": "digital_input",
    "do": "digital_output",
    "dt": "down_timer",
    "f": "float",
    "ft": "float_table",
    "i": "int32",
    "it": "int32_table",
    "s": "string",
    "st": "string_table",
    "ut": "up_timer"
  }
  static RECIPE_VARIABLE_PREFIX = "r"
  static HISTORIAN_VARIABLE_PREFIX = "h"
  static VARIABLE_SEPARATOR = "_"
  static LOG_TRIGGER_REGEX = /^(r|h|rh|hr)?b_([A-Za-z0-9]+(_[A-Za-z0-9]+)*)_Log$/
  static VALID_NAME_REGEX = /^((r|h|rh|hr)?(ai|ao|b|bt|di|do|dt|f|ft|i|it|s|st|ut))(_([A-Za-z0-9]+))+$/
  static LOCAL_RECIPE_FOLDER = "/home/dev/secured/recipe_data/"

  /**
   * Determines if variable name is valid using regular expression.
   * 
   * Valid is defined as starting with a known prefix followed by one or
   * more groups of separator character followed by alphanumeric characters.
   * 
   * @param {string} name Variable name to validate.
   * @returns {boolean}
   */
  static isValidName(name) {
    return (GroovVariable.VALID_NAME_REGEX.exec(name) !== null)
  }

  /**
   * Creates an instance of GroovVariable. Accepts variable
   * name and parses details about variable based on given
   * name.
   * 
   * @param {string} name Variable name.
   */
  constructor(name) {
    this.name = name
    this.nameValid = GroovVariable.isValidName(name)
    this.prefix = null
    this.type = null
    this.isBoolean = false
    this.isRecipe = false
    this.recipePath = null
    this.isHistorian = false
    this.isLogTrigger = false
    this.logDetails = null
    if (this.nameValid) this.parseName()
  }

  /**
   * Parses details about variable based on name.
   * 
   * Determines if variable is recipe or historian variable based on presence
   * of special prefixes. Also uses regex to determine if variable is a log
   * trigger.
   * 
   * If variable is recipe variable, stores paths to save files.
   * 
   * If variable is a log trigger, determines names of supporting variables.
   */
  parseName() {

    // Initialize prefix as text before first separator character. Presence of separator already validated.
    this.prefix = this.name.split(GroovVariable.VARIABLE_SEPARATOR)[0]

    // Remove special prefixes for recipe and historian variables, setting flags as necessary.
    while (this.prefix.charAt(0) === GroovVariable.RECIPE_VARIABLE_PREFIX ||
           this.prefix.charAt(0) === GroovVariable.HISTORIAN_VARIABLE_PREFIX) {
      if (this.prefix.charAt(0) === GroovVariable.RECIPE_VARIABLE_PREFIX) {
        this.isRecipe = true
      } else {
        this.isHistorian = true
      }
      this.prefix = this.prefix.substring(1)
    }

    // Store type if found.
    if (this.prefix in GroovVariable.PREFIXES) {
      this.type = GroovVariable.PREFIXES[this.prefix]
    }

    // Set boolean flag for special boolean prefixes.
    switch (this.prefix) {
      case "b":
      case "bt":
        this.isBoolean = true
        break
    }

    // Add historian flag for certain variable types regardless of presence of special prefix.
    switch (this.type) {
      case "analog_input":
      case "analog_output":
      case "digital_input":
      case "digital_output":
        this.isHistorian = true
        break
    }

    // Store properties specific to recipe variables.
    if (this.isRecipe) {
      this.recipePath = `${GroovVariable.LOCAL_RECIPE_FOLDER + this.name}.json`
    }

    // Determine if variable is a log trigger and store log properties if necessary.
    let m
    if ((m = GroovVariable.LOG_TRIGGER_REGEX.exec(this.name)) !== null) {
      this.isLogTrigger = true
      this.logDetails = {
        id: m[2],
        logTypeVariable: "s_" + m[2] + "_LogType",
        variableNamesTable: "st_" + m[2] + "_Variables",
        fieldNamesTable: "st_" + m[2] + "_Fields",
      }
    }

  }

}

/** Export class. */
module.exports = GroovVariable