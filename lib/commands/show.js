"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sudoPrompt = _interopRequireDefault(require("sudo-prompt"));

var _child_process = require("child_process");

var _cliTable = _interopRequireDefault(require("cli-table"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * show command.
 * 
 * prints all operating system names 
 */
var Show =
/*#__PURE__*/
function () {
  function Show(commandLineArgs, argv) {
    _classCallCheck(this, Show);

    this.optsParser = commandLineArgs;
    this.args = argv;
    this.optionsDefinitions = [{
      'name': 'all',
      alias: 'a',
      defaultOption: true
    }, {
      'name': 'name',
      alias: 'n'
    }];
  }

  _createClass(Show, [{
    key: "exec",
    value: function exec() {
      this.options = this.optsParser(this.optionsDefinitions, this.args); //console.log(this.options);

      this._alreadyMounted();
    }
  }, {
    key: "_alreadyMounted",
    value: function _alreadyMounted() {
      var _this = this;

      // regex for extract information about already mounted devices
      var _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/;
      this._mounted = [];

      var _table = new _cliTable["default"]({
        head: ['Device', 'Mountin Point', 'Type'],
        colWidths: [20, 40, 20]
      });

      (0, _child_process.exec)("mount | grep '^/dev/'", function (err, stdout, stderr) {
        _this._mounted = stdout.split(/\n/).map(function (device) {
          if (device !== null && device.length > 0) {
            var _deviceMatchs = _mountPointRegex.exec(device);

            _table.push([_deviceMatchs[1], _deviceMatchs[5], _deviceMatchs[10]]);

            return {
              "device": _deviceMatchs[1],
              "mountPoint": _deviceMatchs[5],
              "type": _deviceMatchs[10]
            };
          }
        });
        console.log(_table.toString());
      });
      /*
      sudo.exec('lsblk', 
      {name:"mnx"},
      function(err, stdout, stderr){
          console.log('stdout: ', stdout);
      });
      */
    }
  }]);

  return Show;
}();

var _default = Show;
exports["default"] = _default;