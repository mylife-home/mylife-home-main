import cronstrue from 'cronstrue';
import 'cronstrue/locales/fr';
import { CronJob } from 'cron';

import { components } from 'mylife-home-core';
import { logger } from 'mylife-home-common';

const log = logger.createLogger('mylife:home:core:plugins:logic-timers:scheduler');

import m = components.metadata;

@m.plugin({ usage: m.PluginUsage.LOGIC })
@m.config({ name: 'cron', type: m.ConfigType.STRING, description: 'Definition cron du scheduler - https://crontab.guru/' })
export class Scheduler {
  private readonly job: CronJob;

  constructor(config: { cron: string; }) {
    try {
      this.schedule = cronstrue.toString(config.cron, { locale: 'fr' });
      this.job = new CronJob(config.cron, this.onTick);
      this.nextDate = this.job.nextDate().valueOf();

      this.changeJobState(true);
    } catch(err) {
      log.error(err, 'Error initializing scheduler');
    }
  }

  private readonly onTick = () => {
    this.trigger = true;
    this.trigger = false;

    log.debug('Scheduler trigger');

    this.nextDate = this.job.nextDate().valueOf();
  };

  private changeJobState(value: boolean) {
    log.debug(`Scheduler changing job state to '${value}'`);

    if (value) {
      this.job.start();
    } else {
      this.job.stop();
    }

    this.enabled = this.job.running;
  }

  @m.action({ description: 'Permet de désactiver le scheduler. Le trigger reste alors à "false"' })
  disable(arg: boolean) {
    this.changeJobState(!arg);
  }

  @m.state
  enabled: boolean = false;

  @m.state({ description: 'Sortie du sheduler' })
  trigger: boolean = false;

  @m.state({ description: 'Description du planning dans un format lisible pour un humain' })
  schedule: string = null;

  @m.state({ type: new m.Float(), description: 'Timestamp JS avant le prochain déclenchement' })
  nextDate: number = null;

  destroy() {
    this.changeJobState(false);
  }
};

