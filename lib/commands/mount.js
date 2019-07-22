"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sudoPrompt = _interopRequireDefault(require("sudo-prompt"));

var _child_process = require("child_process");

var _cliTable = _interopRequireDefault(require("cli-table"));

var _fs = _interopRequireDefault(require("fs"));

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
var Mount =
/*#__PURE__*/
function () {
  function Mount(commandLineArgs, argv) {
    _classCallCheck(this, Mount);

    // name of the files that contains the list to mount and unmount 
    // partitions
    this._baseTmpDirPath = '/tmp/mbix';
    this._umountListFileName = this._baseTmpDirPath + "/devices_to_unmount.list";
    this._mountListFileName = this._baseTmpDirPath + "/devices_to_mount.list";
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

  _createClass(Mount, [{
    key: "exec",
    value: function exec() {
      this.options = this.optsParser(this.optionsDefinitions, this.args); //console.log(this.options);

      this.mount();
    }
  }, {
    key: "mount",
    value: function mount() {
      this._mountingTemporarily();
    }
  }, {
    key: "_alreadyMounted",
    value: function _alreadyMounted() {
      // regex for extract information about already mounted devices
      var _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/;
      this._mounted = [];
      var stdout = (0, _child_process.execSync)("mount | grep '^/dev/'", {}).toString();
      this._mounted = stdout.split(/\n/).map(function (device) {
        if (device !== null && device.length > 0) {
          var _deviceMatchs = _mountPointRegex.exec(device);

          return {
            "device": _deviceMatchs[1],
            "mountPoint": _deviceMatchs[5],
            "type": _deviceMatchs[10]
          };
        }
      });
      return this._mounted;
    }
  }, {
    key: "_mountingTemporarily",
    value: function _mountingTemporarily() {
      var _this = this;

      var _devicesMountedList = this._alreadyMounted();

      var _devicesMountedPathList = _devicesMountedList.map(function (d) {
        if (d !== undefined) return d['device'];
      });

      var _devicesMountedPathListStr = _devicesMountedPathList.join();

      var _devicesToMount = [];
      var _tmpDirSubDirectories = []; //retrives all necessary devices information

      var _cmd = "lsblk -J -o name,path,label,uuid,partlabel,type";

      var _cmdStdoutRaw = (0, _child_process.execSync)(_cmd, {}).toString();

      var _cmdStdoutJson = JSON.parse(_cmdStdoutRaw);

      if (_cmdStdoutJson['blockdevices'] !== null && Array.isArray(_cmdStdoutJson['blockdevices'])) {
        _cmdStdoutJson['blockdevices'].map(function (disk) {
          //console.log(disk['children'].length);
          disk['children'].map(function (device) {
            var _name = device['name'];
            var _path = device['path'];

            if (_devicesMountedPathListStr.indexOf(_path) === -1) {
              _devicesToMount.push({
                'sourcePath': _path,
                'targetPath': "".concat(_this._baseTmpDirPath, "/").concat(_name)
              });

              _tmpDirSubDirectories.push("".concat(_this._baseTmpDirPath, "/").concat(_name));
            }
          });
        }); //console.log( _tmpDirSubDirectories );
        //console.log(_devicesToMount);


        if (!_fs["default"].existsSync(this._baseTmpDirPath)) {
          (0, _child_process.execSync)("mkdir ".concat(this._baseTmpDirPath), {});
        }

        (0, _child_process.execSync)("touch ".concat(this._mountListFileName), {});
        (0, _child_process.execSync)("touch ".concat(this._umountListFileName), {});
        (0, _child_process.execSync)("echo \"echo mounting devices\" > ".concat(this._mountListFileName), {});

        _devicesToMount.forEach(function (d) {
          if (!_fs["default"].existsSync("".concat(_this._baseTmpDirPath, "/").concat(d.targetPath))) {
            (0, _child_process.execSync)("mkdir ".concat(d.targetPath), {});
          }

          (0, _child_process.execSync)("echo \"mount ".concat(d.sourcePath, " ").concat(d.targetPath, "\" >> ").concat(_this._mountListFileName), {});
          (0, _child_process.execSync)("echo \"umount ".concat(d.targetPath, "\" >> ").concat(_this._umountListFileName), {});
        });

        try {
          _sudoPrompt["default"].exec("source ".concat(this._mountListFileName), {
            name: 'teste'
          }, function (err, stdout, stderr) {
            if (err) throw err;
            console.log(stdout);
          });
        } catch (e) {
          console.log(e.message);
        }
      }
    }
  }]);

  return Mount;
}();

var _default = Mount;
exports["default"] = _default;