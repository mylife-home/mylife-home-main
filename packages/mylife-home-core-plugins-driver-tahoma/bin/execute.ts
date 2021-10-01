import { tools, logger } from 'mylife-home-common';
import { API } from '../src/engine/api';
import { Event, ExecutionStateChangedEvent } from '../src/engine/api-types/event';

tools.injectConfig({ logging: { console: true } });
logger.readConfig();

const [, , user, password, deviceURL, command, ...args] = process.argv;

async function main() {
  try {
    const api = new API(user, password);
    const listenerId = await api.registerEvents();
    const execId = await api.execute({ actions: [{ deviceURL, commands: [{ name: command, parameters: args }] }] });

    while (true) {
      const events = await api.fetchEvents(listenerId);
      for (const event of events) {
        if (processEvent(event, execId)) {
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error(err);
  }
}

function processEvent(untypedEvent: Event, execId: string) {
  if (untypedEvent.name !== 'ExecutionStateChangedEvent') {
    return false;
  }

  const event = untypedEvent as ExecutionStateChangedEvent;
  if (event.execId !== execId) {
    return;
  }

  console.log(event.newState);

  return event.timeToNextState === -1;
}

main();

