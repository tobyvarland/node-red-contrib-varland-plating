module.exports = function(RED) {

  const GroovHistorian = require("../lib/groov-historian");

  function LogToHistorianNode(config) {

    RED.nodes.createNode(this, config);

    this.groovController = RED.nodes.getNode(config.groovController);
    this.influxDB = RED.nodes.getNode(config.influxDB);

    var node = this;

    node.on('input', function(msg) {

      node.status({
        fill: "green",
        shape: "dot",
        text: "processing"
      });

      const historian = new GroovHistorian({
        hostname: node.influxDB.hostname,
        protocol: node.influxDB.protocol,
        port: node.influxDB.port,
        token: node.influxDB.token,
        orgID: node.influxDB.orgID,
        bucket: node.influxDB.bucket
      }, {
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      });
      historian.historize();

      node.status({});

      node.send(msg);

    })
  }
  RED.nodes.registerType("log to historian",
                         LogToHistorianNode);

}