module.exports = function(RED) {

  const GroovClient = require("../lib/groov-client");

  function GetVariableNode(config) {

    RED.nodes.createNode(this, config);

    this.groovController = RED.nodes.getNode(config.groovController);
    this.variableName = config.variableName;
    this.variableNameType = config.variableNameType;
    this.variableValue = config.variableValue;

    var node = this;

    node.on('input', function(msg) {

      node.status({ fill: "green", shape: "dot", text: "processing" });

      const groov = new GroovClient({
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      });

      const variableName = RED.util.evaluateNodeProperty(node.variableName,
                                                         node.variableNameType,
                                                         node,
                                                         msg);

      RED.util.setMessageProperty(msg, node.variableValue, groov.getVariable(variableName));

      node.status({});

      node.send(msg);

    })
  }
  RED.nodes.registerType("get variable",
                         GetVariableNode);

}