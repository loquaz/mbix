import  sudo  from 'sudo-prompt';
import '@babel/polyfill';
/**
 * show command.
 * 
 * prints all operating system names 
 */
class Umount {
    
    constructor(commandLineArgs, argv){

        // name of the file that contains the list of devices to unmount
        this._uMountListFileName    = "/tmp/mbix/devices_to_unmount.list";
        
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
               
            sudo.exec( `source ${this._uMountListFileName }`, {name:'teste'}, (err, stdout, stderr)=>{
                if(err) throw err;
                console.log(stdout);
            })
               
        }catch(e){
            console.log(e.message);
        }
    }

}

export default Umount;