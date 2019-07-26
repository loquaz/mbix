"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sudoPrompt = _interopRequireDefault(require("sudo-prompt"));

var _child_process = require("child_process");

require("@babel/polyfill");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * show command.
 * 
 * prints all operating system names 
 */
var Umount =
/*#__PURE__*/
function () {
  function Umount(commandLineArgs, argv) {
    _classCallCheck(this, Umount);

    // name of the file that contains the list of devices to unmount
    this._umountListFileName = "/tmp/mbix/devices_to_unmount.list";
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

  _createClass(Umount, [{
    key: "exec",
    value: function exec() {
      this.options = this.optsParser(this.optionsDefinitions, this.args);
      this.unmount();
    }
  }, {
    key: "unmount",
    value: function unmount() {
      var _this = this;

      try {
        _sudoPrompt["default"].exec("source ".concat(this._umountListFileName), {
          name: 'teste'
        }, function (err, stdout, stderr) {
          if (err) throw err;
          console.log(stdout);
          (0, _child_process.execSync)("echo \" echo nothing to umount\" > ".concat(_this._umountListFileName), {});
        });
      } catch (e) {
        console.log(e.message);
      }
    }
  }]);

  return Umount;
}();

var _default = Umount;
exports["default"] = _default;