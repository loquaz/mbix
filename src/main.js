#!/usr/local/bin/node

import commandLineArgs from 'command-line-args';
import Show from './commands/show';
import Mount from './commands/mount';

// enum like object with all possible subcommands
const MBX_SUBCOMMANDS = {
    SHOW : 'show',
    MOUNT : 'mount'
}

const mainDefinitions = [
    {'name':'command',  defaultOption: true}
];

const mainOptions   = commandLineArgs(mainDefinitions, {stopAtFirstUnknown:true});
const argv          = mainOptions._unknown || [];

/**
 * Returns a command object that matchs the command
 * name suplied in command line.
 *  
 * @param  _cmd command name 
 * @param  _argv args passed to command
 */
function _getCommandForSubCommand(_cmd, _argv){
    
    switch (_cmd) {
        case MBX_SUBCOMMANDS.SHOW :            
            return new Show(commandLineArgs, _argv);

        case MBX_SUBCOMMANDS.MOUNT :            
            return new Mount(commandLineArgs, _argv);

        default:
            return false;
    }
}

//returns a command instance or false
const command = _getCommandForSubCommand(mainOptions.command, argv);

if(command){
    try {
        command.exec();
    } catch (error) {
        console.log(error.message);
    }
}else{
    console.log(`${mainOptions.command} is not a valid command`);
}