#!/usr/local/bin/node
"use strict";

var _commandLineArgs = _interopRequireDefault(require("command-line-args"));

var _show = _interopRequireDefault(require("./commands/show"));

var _mount = _interopRequireDefault(require("./commands/mount"));

var _umount = _interopRequireDefault(require("./commands/umount"));

var _find = _interopRequireDefault(require("./commands/find"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// enum like object with all possible subcommands
var MBIX_SUBCOMMANDS = {
  SHOW: 'show',
  MOUNT: 'mount',
  UMOUNT: 'umount',
  FIND: 'find'
};
var mainDefinitions = [{
  'name': 'command',
  defaultOption: true
}];
var mainOptions = (0, _commandLineArgs["default"])(mainDefinitions, {
  stopAtFirstUnknown: true
});
var argv = mainOptions._unknown || [];
/**
 * Returns a command object that matchs the command
 * name suplied in command line.
 *  
 * @param  _cmd command name 
 * @param  _argv args passed to command
 */

function _getCommandForSubCommand(_cmd, _argv) {
  switch (_cmd) {
    case MBIX_SUBCOMMANDS.SHOW:
      return new _show["default"](_commandLineArgs["default"], _argv);

    case MBIX_SUBCOMMANDS.MOUNT:
      return new _mount["default"](_commandLineArgs["default"], _argv);

    case MBIX_SUBCOMMANDS.UMOUNT:
      return new _umount["default"](_commandLineArgs["default"], _argv);

    case MBIX_SUBCOMMANDS.FIND:
      return new _find["default"](_commandLineArgs["default"], _argv);

    default:
      return false;
  }
} //returns a command instance or false


var command = _getCommandForSubCommand(mainOptions.command, argv);

if (command) {
  try {
    command.exec();
  } catch (error) {
    console.log(error.message);
  }
} else {
  console.log("".concat(mainOptions.command, " is not a valid command"));
}