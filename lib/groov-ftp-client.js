/** References. */
const ftp = require("basic-ftp");
const fs = require("fs");
const os = require("os");
const GroovVariable = require("./groov-variable");

/**
 * Creates an instance of GroovClient.
 * 
 * @param {object} config Configuration for client.
 * @param {string} config.hostname Host name for FTP server.
 * @param {string} config.username Username for FTP server.
 * @param {string} config.password Password for FTP server.
 * @param {integer} [config.port] Port number for FTP server. Defaults to 21.
 * @param {boolean} [config.secure] Security mode for FTP server. Defaults to false.
 */
function GroovFTPClient(config) {
  this.settings = {
    host: config.hostname,
    port: (("port" in config) ? config.port : 21),
    user: config.username,
    password: config.password,
    secure: (("secure" in config) ? config.secure : false)
  }
  this.client = new ftp.Client();
}

/**
 * @property {string} REMOTE_BASE_FOLDER Base path on FTP server for recipe files.
 */
 GroovFTPClient.REMOTE_BASE_FOLDER = "/GroovRecipes/";

/**
 * Uploads file to FTP server.
 */
GroovFTPClient.prototype.uploadRecipeFiles = function() {
  let self = this;
  let remoteFolder = `${GroovFTPClient.REMOTE_BASE_FOLDER + os.hostname()}/`;
  (async () => {
    try {
      let access = await self.client.access(self.settings);
      let ensure = await self.client.ensureDir(remoteFolder);
      let upload = await self.client.uploadFromDir(GroovVariable.LOCAL_RECIPE_FOLDER);
    } catch (err) {
      console.log(err);
    }
    self.client.close();
  })();
}

/** Export class. */
module.exports = GroovFTPClient