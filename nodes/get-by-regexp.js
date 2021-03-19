module.exports = function(RED) {

  const GroovMatcher = require("../lib/groov-matcher");

  function GetVariablesByRegexpNode(config) {

    RED.nodes.createNode(this, config);

    this.groovController = RED.nodes.getNode(config.groovController);
    this.variableType = config.variableType;
    this.variableNameRegexp = config.variableNameRegexp;
    this.variableNameRegexpType = config.variableNameRegexpType;
    this.variableList = config.variableList;

    var node = this;

    node.on('input', function(msg) {

      node.status({ fill: "green", shape: "dot", text: "processing" });

      const nameRegexp = RED.util.evaluateNodeProperty(node.variableNameRegexp,
                                                       node.variableNameRegexpType,
                                                       node,
                                                       msg);

      const matcher = new GroovMatcher(node.variableType, nameRegexp, {
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      });

      RED.util.setMessageProperty(msg, node.variableList, matcher.find());

      node.status({});

      node.send(msg);

    })
  }
  RED.nodes.registerType("get variables by regexp",
                         GetVariablesByRegexpNode);

}