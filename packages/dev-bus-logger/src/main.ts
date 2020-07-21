import { Logger } from './logger';

const serverUrl = process.env.BUS;

const logger = new Logger(serverUrl);
