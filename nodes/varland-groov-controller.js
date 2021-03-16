module.exports = function(RED) {

  function VarlandGroovControllerNode(n) {
      RED.nodes.createNode(this, n)
      this.hostname = n.hostname
      this.apiKey = n.apiKey
  }
  RED.nodes.registerType("varland groov controller",
                         VarlandGroovControllerNode)

}