module.exports = function(RED) {

  const GroovLog = require("../lib/groov-log")

  function ProcessHistoricLogsNode(config) {

    RED.nodes.createNode(this, config)

    this.groovController = RED.nodes.getNode(config.groovController)

    var node = this

    node.on('input', function(msg) {

      GroovLog.processLogs({
        apiKey: node.groovController.apiKey,
        hostname: node.groovController.hostname
      })

      node.send(msg)

    })
  }
  RED.nodes.registerType("process historic logs",
                         ProcessHistoricLogsNode)

}