module.exports = function(RED) {

  function VarlandFTPServerNode(n) {
      RED.nodes.createNode(this, n);
      this.hostname = n.hostname;
      this.username = n.credentials.username;
      this.password = n.credentials.password;
      this.rootPath = n.rootPath;
  }
  RED.nodes.registerType("varland ftp server",
                         VarlandFTPServerNode);

}