"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _child_process = require("child_process");

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var FSUtil =
/*#__PURE__*/
function () {
  // name of files that contains the list to mount and umount partitions
  function FSUtil() {
    _classCallCheck(this, FSUtil);
  }

  _createClass(FSUtil, [{
    key: "createDir",
    value: function createDir(_path) {
      _fs["default"].mkdirSync(_path);
    }
  }, {
    key: "exec",
    value: function exec(_cmd, _opts) {
      var _options = _opts === undefined ? {} : _opts;

      return (0, _child_process.execSync)(_cmd, _options).toString();
    }
  }, {
    key: "exists",
    value: function exists(_path) {
      return _fs["default"].existsSync(_path);
    }
  }, {
    key: "open",
    value: function open(_path, _mod) {
      return _fs["default"].openSync(_path, _mod);
    }
  }, {
    key: "write",
    value: function write(_fd, _data) {
      _fs["default"].writeSync(_fd, _data);
    }
  }]);

  return FSUtil;
}();

_defineProperty(FSUtil, "BASE_TMP_DIR", '/tmp/mbix');

_defineProperty(FSUtil, "CACHED_DIR_NAME", '/.mbix');

_defineProperty(FSUtil, "UMOUNT_LIST_FILE_NAME", FSUtil.BASE_TMP_DIR + "/devices_to_unmount.list");

_defineProperty(FSUtil, "MOUNT_LIST_FILE_NAME", FSUtil.BASE_TMP_DIR + "/devices_to_mount.list");

var _default = FSUtil;
exports["default"] = _default;