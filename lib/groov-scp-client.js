/** References. */
const SCPClient = require("node-scp");
const fs = require("fs");
const os = require("os");
const GroovVariable = require("./groov-variable");

/**
 * Creates an instance of GroovClient.
 * 
 * @param {object} config Configuration for client.
 * @param {string} config.hostname Host name for SCP server.
 * @param {string} config.username Username for SCP server.
 * @param {string} config.password Password for SCP server.
 * @param {integer} [config.port] Port number for SCP server. Defaults to 2222.
 */
function GroovSCPClient(config) {
  this.settings = {
    host: config.hostname,
    port: (("port" in config) ? config.port : 2222),
    user: config.username,
    password: config.password
  }
}

/**
 * @property {string} REMOTE_BASE_FOLDER Base path on SCP server for recipe files.
 */
GroovSCPClient.REMOTE_BASE_FOLDER = "/volume1/GroovRecipes/";

/**
 * Uploads files to SCP server.
 */
GroovSCPClient.prototype.uploadRecipeFiles = function() {
  let self = this;
  let remoteFolder = `${GroovSCPClient.REMOTE_BASE_FOLDER + os.hostname()}/`;
  (async () => {
    try {
      const client = await SCPClient(self.settings);
      await client.uploadDir(GroovVariable.LOCAL_RECIPE_FOLDER, remoteFolder);
      client.close();
    } catch (err) {
      console.log(err);
    }
  })();
}

/** Export class. */
module.exports = GroovSCPClient