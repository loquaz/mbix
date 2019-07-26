import  sudo  from 'sudo-prompt';
import { execSync as nodeExec }  from 'child_process';
import '@babel/polyfill';
/**
 * show command.
 * 
 * prints all operating system names 
 */
class Umount {
    
    constructor(commandLineArgs, argv){

        // name of the file that contains the list of devices to unmount
        this._umountListFileName    = "/tmp/mbix/devices_to_unmount.list";
        
        this.optsParser = commandLineArgs;
        this.args = argv;
        this.optionsDefinitions = [
            {'name': 'all', alias:'a', defaultOption:true},
            {'name': 'name', alias:'n'},
        ];        
    }
    exec(){
        this.options = this.optsParser(this.optionsDefinitions, this.args);        
        this.unmount();
    }
    
    unmount(){
        
        try{               
            sudo.exec( `source ${this._umountListFileName }`, {name:'teste'}, (err, stdout, stderr)=>{
                if(err) throw err;
                console.log(stdout);
                nodeExec(`echo " echo nothing to umount" > ${this._umountListFileName}`,{});
            })               
        }catch(e){
            console.log(e.message);
        }
    }

}

export default Umount;