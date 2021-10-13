/** References. */
const ftp = require("basic-ftp");
const fs = require("fs");
const os = require("os");

/**
 * Creates an instance of GroovClient.
 * 
 * @param {object} config Configuration for client.
 * @param {string} config.hostname Host name for FTP server.
 * @param {string} config.username Username for FTP server.
 * @param {string} config.password Password for FTP server.
 */
function FTPClient(config) {
  this.settings = {
    host: config.hostname,
    port: 21,
    user: config.username,
    password: config.password,
    secure: false
  }
  this.remoteFolder = "/GroovRecipes/" + os.hostname() + "/";
  this.client = new ftp.Client();
}

/**
 * Uploads file to FTP server.
 * 
 * @param {string[]} locals Path to files on local filesystem.
 */
FTPClient.prototype.upload = function(locals) {
  let self = this;
  (async () => {
    try {
      let access = await self.client.access(self.settings);
      let ensure = await this.client.ensureDir(this.remoteFolder);
      let clear = await this.client.clearWorkingDir();
      for (var i = 0, c = locals.length; i < c; i++) {
        let parts = locals[i].split("/");
        let remotePath = this.remoteFolder + parts[parts.length - 1];
        let upload = await self.client.upload(fs.createReadStream(locals[i]), remotePath);
      }
    } catch (err) {
      console.log(err);
    }
    self.client.close();
  })();
}

/** Export class. */
module.exports = FTPClient