import  sudo  from 'sudo-prompt';
import { execSync as nodeExec }  from 'child_process';
import table from 'cli-table';
import '@babel/polyfill';
/**
 * show command.
 * 
 * prints all operating system names 
 */
class Mount {
    
    constructor(commandLineArgs, argv){

        // name of the files that contains the list to mount and unmount 
        // partitions
        this._unMountListFileName    = "/tmp/mbx/devices_to_unmount.list";
        this._mountListFileName      = "/tmp/mbx/devices_to_mount.list";

        this.optsParser = commandLineArgs;
        this.args = argv;
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
    
    _alreadyMounted() {
        
        // regex for extract information about already mounted devices
        let _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/;
        this._mounted = [];
   
        let stdout = nodeExec("mount | grep '^/dev/'", {}).toString();

        this._mounted = stdout.split(/\n/).map(  function(device)  {

            if(device !== null && device.length > 0 ){
                
                let _deviceMatchs = _mountPointRegex.exec(device);
               
                return {
                    "device" :     _deviceMatchs[1],
                    "mountPoint" : _deviceMatchs[5],
                    "type" :       _deviceMatchs[10]
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
        let _cmd            = "lsblk -J -o name,path,label,uuid,pttype,partlabel,type";
        let _cmdStdoutRaw   = nodeExec(_cmd, {}).toString();
        let _cmdStdoutJson  = JSON.parse( _cmdStdoutRaw ); 
        
        if(_cmdStdoutJson['blockdevices'] !== null && Array.isArray(_cmdStdoutJson['blockdevices'])){
            _cmdStdoutJson['blockdevices'].map(disk=>{
                //console.log(disk['children'].length);
                disk['children'].map(device =>{
                    let _name = device['name'];
                    let _path = device['path'];
                    if(_devicesMountedPathListStr.indexOf(_path) === -1){
                        _devicesToMount.push(
                            {'sourcePath':_path,'targetPath':`/tmp/mbx/${_name}`}
                        );
                        _tmpDirSubDirectories.push(`/tmp/mbx/${_name}`);
                    }
                });                
            })
            //console.log( _tmpDirSubDirectories );
            console.log(_devicesToMount);

            nodeExec(`touch /tmp/mbx/${this._mountListFileName}`,{});
            nodeExec(`touch /tmp/mbx/${this._unMountListFileName}`,{});
            nodeExec(`echo "echo mounting devices" > /tmp/mbx/devices_to_mount.list`,{});

            _devicesToMount.forEach(d=>{
                nodeExec(`echo "mount ${d.sourcePath} ${d.targetPath}" >> ${this._mountListFileName}`,{});
                nodeExec(`echo "unmount ${d.targetPath}" >> ${this._unMountListFileName}`,{});
            })
            
            try{
               
                sudo.exec( 'source /tmp/mbx/devices_to_mount.list', {name:'teste'}, (err, stdout, stderr)=>{
                    if(err) throw err;
                    console.log(stdout);
                })
               
            }catch(e){
                console.log(e.message);
            }
        }        

    }

    _mountInTmpDir(){
        console.log('uhuuuu');
    }
    
}

export default Mount;