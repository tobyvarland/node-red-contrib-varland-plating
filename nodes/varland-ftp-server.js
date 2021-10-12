module.exports = function(RED) {

  function VarlandFTPServerNode(n) {
      RED.nodes.createNode(this, n);
      this.hostname = n.hostname;
      this.username = n.username;
      this.password = n.password;
      this.rootPath = n.rootPath;
  }
  RED.nodes.registerType("varland ftp server",
                         VarlandFTPServerNode);

}