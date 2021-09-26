import { Connection, Device } from '../lib/engine';

const con = new Connection({
  user: process.argv[2],
  password: process.argv[3]
});

con.once('devicesRefresh', () => {
  for(const dev of con.devices) {
    console.log(`label: '${dev.label}', url: '${dev.deviceURL}', type: '${dev.controllableName}'`);
    for(const cmd of dev.definition.commands) {
      console.log(`  command: ${cmd.commandName} (${cmd.nparams})`);
    }
    for(const state of dev.definition.states) {
      console.log(`  state: ${state.qualifiedName} (${state.type})`);
    }
  }
  con.close();
});