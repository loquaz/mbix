import { execSync as nodeExec }  from 'child_process';
import fs from 'fs';

class FSUtil{

    // name of files that contains the list to mount and umount partitions
    static BASE_TMP_DIR             = '/tmp/mbix';
    static CACHED_DIR_NAME          = '/.mbix';
    static UMOUNT_LIST_FILE_NAME    = this.BASE_TMP_DIR + "/devices_to_unmount.list";
    static MOUNT_LIST_FILE_NAME     = this.BASE_TMP_DIR + "/devices_to_mount.list";

    constructor(){}

    createDir( _path ){
        fs.mkdirSync( _path );
    }

    exec(_cmd, _opts){
        let _options = ( _opts === undefined ) ? {} : _opts;
        return nodeExec(_cmd, _options).toString();
    }

    exists(_path){
        return fs.existsSync(_path);
    }

    open(_path, _mod){
        return fs.openSync(_path, _mod);
    }

    write(_fd, _data){
        fs.writeSync(_fd, _data);
    }
}

export default FSUtil