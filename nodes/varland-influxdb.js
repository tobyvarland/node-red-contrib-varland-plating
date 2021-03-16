module.exports = function(RED) {

  function VarlandInfluxDBNode(n) {
      RED.nodes.createNode(this, n);
      this.hostname = n.hostname;
      this.protocol = n.protocol;
      this.port = n.port;
      this.token = n.token;
      this.orgID = n.orgID;
      this.bucket = n.bucket;
  }
  RED.nodes.registerType("varland influxdb",
                         VarlandInfluxDBNode);

}