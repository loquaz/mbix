import sudo from 'sudo-prompt';
import '@babel/polyfill';
import FSUtil from '../fsutil/fs';
/**
 * find command.
 * 
 * prints all operating system names 
 */
class Find {

    constructor(commandLineArgs, argv) {

        this._fs = new FSUtil();

        this.optsParser = commandLineArgs;
        this.args = argv;
        this.optionsDefinitions = [
            { name: 'all', alias: 'a', defaultOption: true },
            { name: 'distros', alias: 'd' },
            { name: 'name', alias: 'n' },
            { name: 'cached', alias: 'c', 'type': Boolean }
        ];
    }
    
    exec() {
        this.options = this.optsParser(this.optionsDefinitions, this.args);
        //console.log(this.options.distros, this.options.cached);
        this.find();
    }

    find() {

        /**
         * if distro name wasn't informed, search for all
         * otherwise, search for the informed distro only
         */
        let _searchAll = (this.options.name === undefined) ? true : false;

        /*
         * if cached option was setted, searchs for info in
         * $HOME/.mbix/<disto_name> otherwise mount
         * devices and searchs inside them.
         */
        let _cached = (this.options.cached === undefined) ? false : true;

        /**
         * Distro name
         */
        let _name = (this.options.name === undefined) ? null : this.options.name;

        let _options = {
            all: _searchAll,
            cached: _cached,
            name: _name
        }

        this._search(_options);
    }

    /**
     * 
     * @param  opts search options
     */
    _search(_opts) {

        if (_opts.all) {
            this._searchAll(_opts.cached);
        } else if (_opts.name !== null) {
            this._searchDistro(_opts.name, _opts.cached);
        } else {
            let _msg = "You provided an empty option [-n].\n";
            _msg += "The [-n] option is the distro name\n";
            _msg += "If you want to search for all distros, remove the option."
            console.log(_msg);
        }
    }

    _searchAll(_cached) {

        if (_cached) { }
        else {
            // verifies if /tmp/mbix already exists*
            let _baseTmpDirExists = this._fs.exists(FSUtil.BASE_TMP_DIR);

            if (_baseTmpDirExists) {

                try {
                    let _regex      = '".*sd[a-z]{1}[0-9]{1,3}/etc/os-release$"';
                    let _findCmd    = `find ${FSUtil.BASE_TMP_DIR} -regextype egrep -regex ${_regex} `;
                    _findCmd        += ` -print -exec cat {} \\; 2> /dev/null`;

                    sudo.exec(`${_findCmd}`, { name: 'mbix' }, (err, stdout, stderr) => {
                        if (err) throw err;

                        let _cmdOutputArray = stdout.split(/\n/);
                        let _distros        = this._parseDistrosFromArray( _cmdOutputArray );

                        _distros.forEach( _distro => {
                            // to discover the distro partitions we need to ready the fstab file 
                            let _fstab = this._fs.exec( `cat ${FSUtil.BASE_TMP_DIR}/${_distro['device']}/etc/fstab` );
                            
                            let _fstabSplited   = _fstab.split(/\n/);
                            let _mountPoints    = [];

                            _fstabSplited.forEach( line => {

                                if(line.substring(0,4) == "UUID"){
                                    let _info       = line.split(/\s+/);
                                    let _mountPoint = {};
                                    /**
                                     * 0 = UUID
                                     * 1 = MOUNT POINT
                                     * 2 = FILESYSTEM TYPE                                     
                                     */
                                    _mountPoint['uuid']        = _info[0].split("=")[1];
                                    _mountPoint['mountPoint']  = _info[1];
                                    _mountPoint['fs']          = _info[2];
                                    _mountPoints.push( _mountPoint );
                                }

                            });

                            _distro['mountPoints'] = _mountPoints;

                        });

                        // cache the information
                        this._saveInCache( _distros );

                        console.log(_distros[0]['mountPoints']);
                    })
                } catch (e) {
                    console.log(e.message);
                }

            } else {

            };
        }
        console.log('all', _cached);
    }
    _searchDistro(_name, _cached) {
        console.log(_name, _cached);
    }

    /**
     * Returns an array of json objects with distro information
     * 
     * @param {*} _inputArr Array with information about distros 
     */
    _parseDistrosFromArray( _inputArr ) {

        let _distros        = [];
        let _distrosCount   = 0;

        // flag to control the creation of distro json objects
        let _createNewDistro = true;
        let _distro = {};

        if (Array.isArray(_inputArr) && _inputArr.length > 0) {

            _inputArr.forEach(line => {

                // if line begins with /tmp/mbix
                // this is the first line
                // so, extracts the partion name, creates a json object
                // and saves this info in the device key of that object
                if (line.indexOf(FSUtil.BASE_TMP_DIR) !== -1) {

                    _createNewDistro = true;
                    let _device = line.substring(FSUtil.BASE_TMP_DIR.length + 1);
                    _device = _device.substring(0, _device.indexOf('/'));
                    _distro['device'] = _device;
                    return;

                } else {

                    let _key = line.split("=")[0];
                    let _value = line.split("=")[1];

                    if (_key === "NAME") { // name

                        _distro['name'] = _value;

                    } else if (_key === "VERSION") { //version

                        _distro['version'] = _value;

                    } else if (_key === "ID") { //id

                        _distro['id'] = _value;
                        _distros.push(_distro)
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
    _saveInCache( _distros ){

        let _$home      = this._fs.exec( "echo $HOME"  ).split(/\n/)[0];
        let _cacheDir   = _$home + FSUtil.CACHED_DIR_NAME;
        
        if(!this._fs.exists( _cacheDir )){
            this._fs.createDir( _cacheDir )
        }

        _distros.forEach( _distro => {

            let _fileName       = _distro['id'] + '.' + _distro['device'] + '.json';
            let _fileContent    = JSON.stringify( _distro );
            this._fs.exec( `touch ${_cacheDir}/${_fileName}` );
            let _fd             = this._fs.open( _cacheDir + '/' + _fileName, 'w+');
            this._fs.write( _fd, _fileContent);
            console.log( _fileName );             

        });
        
        //console.log( _cacheDir );


    }

}

export default Find;