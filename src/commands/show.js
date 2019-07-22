import  sudo  from 'sudo-prompt';
import { exec as nodeExec }  from 'child_process';
import table from 'cli-table';
/**
 * show command.
 * 
 * prints all operating system names 
 */
class Show {
    constructor(commandLineArgs, argv){
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
        this._alreadyMounted();
    }

    _alreadyMounted(){
        
        // regex for extract information about already mounted devices
        let _mountPointRegex = /^(\/dev\/[a-z]{1,3}[0-9]{1,2})(\s+)(on)(\s+)(\/(.*)?)(\s+)(type)(\s+)([a-zA-Z0-9]+)(\s+)(.*)$/
        this._mounted = [];

        var _table =  new table({
            head: ['Device', 'Mountin Point', 'Type'],
            colWidths :[20, 40, 20]
        })
        
        nodeExec("mount | grep '^/dev/'", (err, stdout, stderr)=>{

            this._mounted = stdout.split(/\n/).map(device => {

                if(device !== null && device.length > 0 ){
                    
                    let _deviceMatchs = _mountPointRegex.exec(device);

                    _table.push([_deviceMatchs[1],_deviceMatchs[5],_deviceMatchs[10]]);
                    
                    return {
                        "device" :    _deviceMatchs[1],
                        "mountPoint" : _deviceMatchs[5],
                        "type" :       _deviceMatchs[10]
                    }                    
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
}

export default Show;