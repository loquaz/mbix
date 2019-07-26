"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sudoPrompt = _interopRequireDefault(require("sudo-prompt"));

require("@babel/polyfill");

var _fs = _interopRequireDefault(require("../fsutil/fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * find command.
 * 
 * prints all operating system names 
 */
var Find =
/*#__PURE__*/
function () {
  function Find(commandLineArgs, argv) {
    _classCallCheck(this, Find);

    this._fs = new _fs["default"]();
    this.optsParser = commandLineArgs;
    this.args = argv;
    this.optionsDefinitions = [{
      name: 'all',
      alias: 'a',
      defaultOption: true
    }, {
      name: 'distros',
      alias: 'd'
    }, {
      name: 'name',
      alias: 'n'
    }, {
      name: 'cached',
      alias: 'c',
      'type': Boolean
    }];
  }

  _createClass(Find, [{
    key: "exec",
    value: function exec() {
      this.options = this.optsParser(this.optionsDefinitions, this.args); //console.log(this.options.distros, this.options.cached);

      this.find();
    }
  }, {
    key: "find",
    value: function find() {
      /**
       * if distro name wasn't informed, search for all
       * otherwise, search for the informed distro only
       */
      var _searchAll = this.options.name === undefined ? true : false;
      /*
       * if cached option was setted, searchs for info in
       * $HOME/.mbix/distros/<disto_name> otherwise mount
       * devices and searchs inside them.
       */


      var _cached = this.options.cached === undefined ? false : true;
      /**
       * Distro name
       */


      var _name = this.options.name === undefined ? null : this.options.name;

      var _options = {
        all: _searchAll,
        cached: _cached,
        name: _name
      };

      this._search(_options);
    }
    /**
     * 
     * @param  opts search options
     */

  }, {
    key: "_search",
    value: function _search(_opts) {
      if (_opts.all) {
        this._searchAll(_opts.cached);
      } else if (_opts.name !== null) {
        this._searchDistro(_opts.name, _opts.cached);
      } else {
        var _msg = "You provided an empty option [-n].\n";
        _msg += "The [-n] option is the distro name\n";
        _msg += "If you want to search for all distros, remove the option.";
        console.log(_msg);
      }
    }
  }, {
    key: "_searchAll",
    value: function _searchAll(_cached) {
      var _this = this;

      if (_cached) {} else {
        // verifies if /tmp/mbix already exists*
        var _baseTmpDirExists = this._fs.exists(_fs["default"].BASE_TMP_DIR);

        if (_baseTmpDirExists) {
          try {
            var _regex = '".*sd[a-z]{1}[0-9]{1,3}/etc/os-release$"';

            var _findCmd = "find ".concat(_fs["default"].BASE_TMP_DIR, " -regextype egrep -regex ").concat(_regex, " ");

            _findCmd += " -print -exec cat {} \\; 2> /dev/null";

            _sudoPrompt["default"].exec("".concat(_findCmd), {
              name: 'mbix'
            }, function (err, stdout, stderr) {
              if (err) throw err;

              var _cmdOutputArray = stdout.split(/\n/);

              var _distros = _this._parseDistrosFromArray(_cmdOutputArray);

              _distros.forEach(function (_distro) {
                // to discover the distro partitions we need to ready the fstab file 
                var _fstab = _this._fs.exec("cat ".concat(_fs["default"].BASE_TMP_DIR, "/").concat(_distro['device'], "/etc/fstab"));

                var _fstabSplited = _fstab.split(/\n/);

                var _mountPoints = [];

                _fstabSplited.forEach(function (line) {
                  if (line.substring(0, 4) == "UUID") {
                    var _info = line.split(/\s+/);

                    var _mountPoint = {};
                    /**
                     * 0 = UUID
                     * 1 = MOUNT POINT
                     * 2 = FILESYSTEM TYPE                                     
                     */

                    _mountPoint['uuid'] = _info[0].split("=")[1];
                    _mountPoint['mountPoint'] = _info[1];
                    _mountPoint['fs'] = _info[2];

                    _mountPoints.push(_mountPoint);
                  }
                });

                _distro['mountPoints'] = _mountPoints;
              }); // cache the information


              _this._saveInCache(_distros);

              console.log(_distros[0]['mountPoints']);
            });
          } catch (e) {
            console.log(e.message);
          }
        } else {}

        ;
      }

      console.log('all', _cached);
    }
  }, {
    key: "_searchDistro",
    value: function _searchDistro(_name, _cached) {
      console.log(_name, _cached);
    }
    /**
     * Returns an array of json objects with distro information
     * 
     * @param {*} _inputArr Array with information about distros 
     */

  }, {
    key: "_parseDistrosFromArray",
    value: function _parseDistrosFromArray(_inputArr) {
      var _distros = [];
      var _distrosCount = 0; // flag to control the creation of distro json objects

      var _createNewDistro = true;
      var _distro = {};

      if (Array.isArray(_inputArr) && _inputArr.length > 0) {
        _inputArr.forEach(function (line) {
          // if line begins with /tmp/mbix
          // this is the first line
          // so, extracts the partion name, creates a json object
          // and saves this info in the device key of that object
          if (line.indexOf(_fs["default"].BASE_TMP_DIR) !== -1) {
            _createNewDistro = true;

            var _device = line.substring(_fs["default"].BASE_TMP_DIR.length + 1);

            _device = _device.substring(0, _device.indexOf('/'));
            _distro['device'] = _device;
            return;
          } else {
            var _key = line.split("=")[0];
            var _value = line.split("=")[1];

            if (_key === "NAME") {
              // name
              _distro['name'] = _value;
            } else if (_key === "VERSION") {
              //version
              _distro['version'] = _value;
            } else if (_key === "ID") {
              //id
              _distro['id'] = _value;

              _distros.push(_distro);

              ++_distrosCount;
              return;
            }

            _createNewDistro = false;
          }

          if (_createNewDistro) {
            _distro = {};
          }
        });
      }

      return _distros;
    }
    /**
     * 
     * @param  _distros 
     */

  }, {
    key: "_saveInCache",
    value: function _saveInCache(_distros) {
      var _this2 = this;

      var _$home = this._fs.exec("echo $HOME").split(/\n/)[0];

      var _cacheDir = _$home + _fs["default"].CACHED_DIR_NAME;

      if (!this._fs.exists(_cacheDir)) {
        this._fs.createDir(_cacheDir);
      }

      _distros.forEach(function (_distro) {
        var _fileName = _distro['id'] + '.' + _distro['device'] + '.json';

        var _fileContent = JSON.stringify(_distro);

        _this2._fs.exec("touch ".concat(_cacheDir, "/").concat(_fileName));

        var _fd = _this2._fs.open(_cacheDir + '/' + _fileName, 'w+');

        _this2._fs.write(_fd, _fileContent);

        console.log(_fileName);
      }); //console.log( _cacheDir );

    }
  }]);

  return Find;
}();

var _default = Find;
exports["default"] = _default;