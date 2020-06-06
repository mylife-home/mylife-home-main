import 'source-map-support/register';
import { tools } from 'mylife-home-common';
import { Manager } from './manager';

tools.init('core');

const manager = new Manager();

/*await*/ manager.init();

// TODO terminate