module.exports = function(RED) {

  const GroovPreserver = require("../lib/groov-preserver");

  function PreserveRecipeDataNode(config) {

    RED.nodes.createNode(this, config);

    this.groovController = RED.nodes.getNode(config.groovController);
    this.ftpServer = RED.nodes.getNode(config.ftpServer);

    var node = this;

    node.on('input', function(msg) {

      node.status({ fill: "green", shape: "dot", text: "processing" });

      const preserver = new GroovPreserver({
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      }, {
        hostname: node.ftpServer.hostname,
        username: node.ftpServer.username,
        password: node.ftpServer.password
      });
      preserver.process();

      node.status({});

      node.send(msg);

    })
  }
  RED.nodes.registerType("preserve recipe data",
                         PreserveRecipeDataNode);

}