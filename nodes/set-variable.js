module.exports = function(RED) {

  const GroovClient = require("../lib/groov-client");

  function SetVariableNode(config) {

    RED.nodes.createNode(this, config);

    this.groovController = RED.nodes.getNode(config.groovController);
    this.variableName = config.variableName;
    this.variableNameType = config.variableNameType;
    this.variableValue = config.variableValue;
    this.variableValueType = config.variableValueType;

    var node = this;

    node.on('input', function(msg) {

      const groov = new GroovClient({
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      });

      const variableName = RED.util.evaluateNodeProperty(node.variableName,
                                                         node.variableNameType,
                                                         node,
                                                         msg);
      const variableValue = RED.util.evaluateNodeProperty(node.variableValue,
                                                          node.variableValueType,
                                                          node,
                                                          msg);

      groov.setVariable(variableName, variableValue);

      node.send(msg);

    })
  }
  RED.nodes.registerType("set variable",
                         SetVariableNode);

}