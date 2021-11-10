# node-red-contrib-varland-plating

This package contains a group of nodes used by [Varland Plating](http://www.varland.com) in conjunction with [Opto22 Groov EPIC PR-1](https://www.opto22.com/products/product-container/grv-epic-pr1) processors for in-house automation projects.

All functions are specifically tailored to Varland based on internal variable naming conventions.

## Node Descriptions

### Configuration Nodes

- **`varland groov controller`**  
  Used to define a connection to a Groov EPIC-PR1 controller based on a hostname and API key. Internal functions assume https communications, though certificate warnings are suppressed (meaning no certificate file needs to be supplied).
  
- **`varland influxdb`**  
  Used to define a connection to an InfluxDB v2+ historian database. Uses the `influxdb-v2` package sponsored by Stackhero.

### Normal Nodes

- **`get variable`**  
  Used to dynamically read a variable value after determining the variable type based on the variable name. The variable name may be passed in as a string or a message property, and the variable value is returned to a specified message property.

- **`set variable`**  
  Used to dynamically set a variable value after determining the variable type based on the variable name. The variable name may be passed in as a string or a message property. The variable value may be passed in as a string, number, boolean, or message property.

- **`log to historian`**  
  Checks the strategy for all variables meeting the definition of historian variables (all I/O and variables using the `h` prefix) and logs the values to the given InfluxDB historian.

- **`preserve recipe data`**  
  Immediately after a download, retrieves variable values from backup files and sets the variable values in the controller. After retrieving all saved values, sets flags to send node into save mode. In save mode, periodically overwrites the backup file for each recipe file.

- **`process historic logs`**  
  Checks the strategy for all variables meeting the defintion of historic log triggers and triggers the log if the trigger is set to true.

- **`get variables by regexp`**  
  Used to return values of all variables of selected type whose name matches the supplied regular expression.