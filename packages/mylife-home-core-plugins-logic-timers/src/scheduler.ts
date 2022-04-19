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
      this.refreshNextDate();

      log.debug('Scheduler starting job');
      this.job.start();
    } catch(err) {
      log.error(err, 'Error initializing scheduler');
    }
  }

  private readonly onTick = () => {
    if (this.enabled) {
      this.trigger = true;
      this.trigger = false;
  
      log.debug('Scheduler trigger');
    } else {
      log.debug('Skipping scheduler trigger (disabled)');
    }

    this.refreshNextDate();
  };

  private refreshNextDate() {
    this.nextDate = this.job.nextDate().valueOf();
  }

  @m.action({ description: 'Permet de désactiver le scheduler. Le trigger reste alors à "false"' })
  disable(arg: boolean) {
    this.enabled = !arg;
    log.debug(`Scheduler changed job state to '${this.enabled}'`);
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
    log.debug('Scheduler stopping job');
    this.job.stop();
  }
};

