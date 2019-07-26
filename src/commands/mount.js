import  sudo  from 'sudo-prompt';
import { execSync as nodeExec }  from 'child_process';
import fs from 'fs';
import '@babel/polyfill';
import FSUtil from '../fsutil/fs';

/**
 * show command.
 * 
 * prints all operating system names 
 */
class Mount {
    
    constructor(commandLineArgs, argv){

        this._fs        = new FSUtil();
        this.optsParser = commandLineArgs;
        this.args       = argv;
        this.optionsDefinitions = [
            {'name': 'all', alias:'a', defaultOption:true},
            {'name': 'name', alias:'n'},
        ];        
    }

    exec(){
        this.options = this.optsParser(this.optionsDefinitions, this.args);
        //console.log(this.options);
        this.mount();
    }

    mount(){
        this._mountingTemporarily();
    }
    
    /**
     * Returns an array with all already mounted devices
     */
    _alreadyMounted() {
        
        // regex for extract information about already mounted devices
        let _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/;
        this._mounted = [];
   
        let stdout = nodeExec("mount | grep '^/dev/'", {}).toString();

        this._mounted = stdout.split(/\n/).map(  function(device)  {

            if(device !== null && device.length > 0 ){
                
                let _deviceMatchs = _mountPointRegex.exec(device);
               
                return {
                    "device" :     _deviceMatchs[1], // /dev/device[number] ex.: /dev/sda1
                    "mountPoint" : _deviceMatchs[5], // ex.: /home
                    "type" :       _deviceMatchs[10] // ex.: ext4
                }                    
            }
        });
        
        return this._mounted;
        
    }

    _mountingTemporarily(  ){

        let _devicesMountedList     = this._alreadyMounted();
        let _devicesMountedPathList = _devicesMountedList.map( d => {
            if(d !== undefined)
                return d['device'];
        });

        let _devicesMountedPathListStr  = _devicesMountedPathList.join();
        let _devicesToMount             = [];
        let _tmpDirSubDirectories       = [];
        
        //retrives all necessary devices information
        let _cmd            = "lsblk -J -o name,label,uuid,pttype,fstype,partlabel,type";
        let _cmdOutput      = this._fs.exec(_cmd);
        let _cmdOutputJson  = JSON.parse( _cmdOutput );       
        
        if(_cmdOutputJson['blockdevices'] !== null && Array.isArray(_cmdOutputJson['blockdevices'])){
            _cmdOutputJson['blockdevices'].map(disk=>{
                
                //for each partition in current disk
                disk['children'].map(device =>{
                    
                    let _name       = device['name'];
                    let _path       = `/dev/${_name}`;
                    let _deviceInfo = {};

                    //device info
                    _deviceInfo['name']     = _name;
                    _deviceInfo['path']     = _path;
                    _deviceInfo['type']     = device['pttype'];
                    _deviceInfo['fstype']   = device['fstype'];
                    _deviceInfo['uuid']     = device['uuid'];
                    _deviceInfo['label']    = device['label'];
                    _deviceInfo['info']     = {};

                    this._createFileInfoForDevice( _deviceInfo );

                    // if the current device isn't not mounted
                    // stores info about it to mount
                    if(_devicesMountedPathListStr.indexOf(_path) === -1){
                        _devicesToMount.push(
                            {'sourcePath':_path,'targetPath':`${FSUtil.BASE_TMP_DIR}/${_name}`}
                        );
                        _tmpDirSubDirectories.push(`${FSUtil.BASE_TMP_DIR}/${_name}`);
                    }
                });                
            })
           
            //creates mbix subdirectory under /tmp if it do not exists yet
            if(!fs.existsSync(FSUtil.BASE_TMP_DIR)){
                this._fs.createDir(FSUtil.BASE_TMP_DIR);
            }

            this._fs.exec(`touch ${FSUtil.MOUNT_LIST_FILE_NAME}`);
            this._fs.exec(`touch ${FSUtil.UMOUNT_LIST_FILE_NAME}`);
            this._fs.exec(`echo "echo mounting devices" > ${FSUtil.MOUNT_LIST_FILE_NAME}`);
            this._fs.exec(`echo "echo umounting devices" > ${FSUtil.UMOUNT_LIST_FILE_NAME}`);

            _devicesToMount.forEach(d=>{
                if(!this._fs.exists(`${d.targetPath}`)){
                    this._fs.createDir( d.targetPath );
                }
                this._fs.exec(`echo "mount ${d.sourcePath} ${d.targetPath}" >> ${FSUtil.MOUNT_LIST_FILE_NAME}`);
                this._fs.exec(`echo "umount ${d.targetPath}" >> ${FSUtil.UMOUNT_LIST_FILE_NAME}`);
            })

            this._fs.exec(`echo "echo [done] mounting devices" >> ${FSUtil.MOUNT_LIST_FILE_NAME}`);
            
            try{               
                sudo.exec( `source ${FSUtil.MOUNT_LIST_FILE_NAME}`, {name:'teste'}, (err, stdout, stderr)=>{
                    if(err) throw err;
                    console.log(stdout);
                })               
            }catch(e){
                console.log(e.message);
            }
        }        

    }
    
    /**
     * 
     * @param _info json object with device info 
     */
    _createFileInfoForDevice( _info ){
        let _path = FSUtil.BASE_TMP_DIR + '/' + _info.name + '.json';
        try{
          let _fd = this._fs.open(_path, 'w+');
          this._fs.write(_fd, JSON.stringify( _info ) );
        }catch(e){
            console.log(e.message);
        }
    }

}

export default Mount;