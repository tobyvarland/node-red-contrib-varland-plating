module.exports = function(RED) {

  function VarlandGroovFTPServerNode(n) {
      RED.nodes.createNode(this, n);
      this.hostname = n.hostname;
      this.username = n.username;
      this.password = n.password;
  }
  RED.nodes.registerType("varland groov ftp server",
                         VarlandGroovFTPServerNode);

}