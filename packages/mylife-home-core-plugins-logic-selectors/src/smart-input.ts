import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';
import InputManager from './services/input-manager';

const log = logger.createLogger('mylife:home:core:plugins:logic-selectors:smart-input');

import m = components.metadata;

const TRIGGER_CONFIG_DESCRIPTION = 'Séquence pour déclencher l\'action. Ex: "l ss" ou "l|ss"';

interface Config {
  trigger0: string;
  trigger1: string;
  trigger2: string;
  trigger3: string;
}

type Output = 'output0' | 'output1' | 'output2' | 'output3';

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'triggers0', type: m.ConfigType.STRING, description: TRIGGER_CONFIG_DESCRIPTION })
@m.config({ name: 'triggers1', type: m.ConfigType.STRING, description: TRIGGER_CONFIG_DESCRIPTION })
@m.config({ name: 'triggers2', type: m.ConfigType.STRING, description: TRIGGER_CONFIG_DESCRIPTION })
@m.config({ name: 'triggers3', type: m.ConfigType.STRING, description: TRIGGER_CONFIG_DESCRIPTION })
export class SmartInput {

  private readonly manager = new InputManager();

  constructor(config: Config) {
    const createAction = (key: Output) => {
      return () => {
        this[key] = true;
        this[key] = false;
      };
    };

    for (let index = 0; index < 4; ++index) {
      const configKey = `triggers${index}` as keyof Config;
      const outputKey = `output${index}` as Output;

      // http://stackoverflow.com/questions/650022/how-do-i-split-a-string-with-multiple-separators-in-javascript
      // seps are '|' and ' ', multiple separators act as one
      const triggers = (config[configKey] || '').split(/(?:\|| )+/);

      if (triggers.length === 0) {
        continue;
      }

      log.debug(`configuring triggers: ${triggers}`);
      for (const trigger of triggers) {
        this.manager.config[trigger] = createAction(outputKey);
      }
    }
  }

  @m.state
  output0: boolean = false;

  @m.state
  output1: boolean = false;

  @m.state
  output2: boolean = false;

  @m.state
  output3: boolean = false;

  @m.action
  action(arg: boolean) {
    if (arg) {
      this.manager.down();
    } else {
      this.manager.up();
    }
  }
};
