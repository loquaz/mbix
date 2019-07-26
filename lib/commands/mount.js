"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sudoPrompt = _interopRequireDefault(require("sudo-prompt"));

var _child_process = require("child_process");

var _fs = _interopRequireDefault(require("fs"));

require("@babel/polyfill");

var _fs2 = _interopRequireDefault(require("../fsutil/fs"));

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

    this._fs = new _fs2["default"]();
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
    /**
     * Returns an array with all already mounted devices
     */

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
            // /dev/device[number] ex.: /dev/sda1
            "mountPoint": _deviceMatchs[5],
            // ex.: /home
            "type": _deviceMatchs[10] // ex.: ext4

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

      var _cmd = "lsblk -J -o name,label,uuid,pttype,fstype,partlabel,type";

      var _cmdOutput = this._fs.exec(_cmd);

      var _cmdOutputJson = JSON.parse(_cmdOutput);

      if (_cmdOutputJson['blockdevices'] !== null && Array.isArray(_cmdOutputJson['blockdevices'])) {
        _cmdOutputJson['blockdevices'].map(function (disk) {
          //for each partition in current disk
          disk['children'].map(function (device) {
            var _name = device['name'];

            var _path = "/dev/".concat(_name);

            var _deviceInfo = {}; //device info

            _deviceInfo['name'] = _name;
            _deviceInfo['path'] = _path;
            _deviceInfo['type'] = device['pttype'];
            _deviceInfo['fstype'] = device['fstype'];
            _deviceInfo['uuid'] = device['uuid'];
            _deviceInfo['label'] = device['label'];
            _deviceInfo['info'] = {};

            _this._createFileInfoForDevice(_deviceInfo); // if the current device isn't not mounted
            // stores info about it to mount


            if (_devicesMountedPathListStr.indexOf(_path) === -1) {
              _devicesToMount.push({
                'sourcePath': _path,
                'targetPath': "".concat(_fs2["default"].BASE_TMP_DIR, "/").concat(_name)
              });

              _tmpDirSubDirectories.push("".concat(_fs2["default"].BASE_TMP_DIR, "/").concat(_name));
            }
          });
        }); //creates mbix subdirectory under /tmp if it do not exists yet


        if (!_fs["default"].existsSync(_fs2["default"].BASE_TMP_DIR)) {
          this._fs.createDir(_fs2["default"].BASE_TMP_DIR);
        }

        this._fs.exec("touch ".concat(_fs2["default"].MOUNT_LIST_FILE_NAME));

        this._fs.exec("touch ".concat(_fs2["default"].UMOUNT_LIST_FILE_NAME));

        this._fs.exec("echo \"echo mounting devices\" > ".concat(_fs2["default"].MOUNT_LIST_FILE_NAME));

        this._fs.exec("echo \"echo umounting devices\" > ".concat(_fs2["default"].UMOUNT_LIST_FILE_NAME));

        _devicesToMount.forEach(function (d) {
          if (!_this._fs.exists("".concat(d.targetPath))) {
            _this._fs.createDir(d.targetPath);
          }

          _this._fs.exec("echo \"mount ".concat(d.sourcePath, " ").concat(d.targetPath, "\" >> ").concat(_fs2["default"].MOUNT_LIST_FILE_NAME));

          _this._fs.exec("echo \"umount ".concat(d.targetPath, "\" >> ").concat(_fs2["default"].UMOUNT_LIST_FILE_NAME));
        });

        this._fs.exec("echo \"echo [done] mounting devices\" >> ".concat(_fs2["default"].MOUNT_LIST_FILE_NAME));

        try {
          _sudoPrompt["default"].exec("source ".concat(_fs2["default"].MOUNT_LIST_FILE_NAME), {
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
    /**
     * 
     * @param _info json object with device info 
     */

  }, {
    key: "_createFileInfoForDevice",
    value: function _createFileInfoForDevice(_info) {
      var _path = _fs2["default"].BASE_TMP_DIR + '/' + _info.name + '.json';

      try {
        var _fd = this._fs.open(_path, 'w+');

        this._fs.write(_fd, JSON.stringify(_info));
      } catch (e) {
        console.log(e.message);
      }
    }
  }]);

  return Mount;
}();

var _default = Mount;
exports["default"] = _default;