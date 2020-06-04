import 'source-map-support/register';
import { tools } from 'mylife-home-common';
import { Manager } from './manager';

tools.setDefine('main-component', 'core');

const manager = new Manager();

// TODO terminate