import { logger } from 'mylife-home-common';
import { Message, ZoneUpdate } from './types';

const log = logger.createLogger('mylife:home:core:plugins:driver-absoluta:engine:parser');

// Note: Regex are statefull on exec
const MESSAGE_EXTRACTOR = />(.*)Maison(.*)</g;
const messageParser = () => />(.*)\(Maison\)(\s*)\((.*)\)</g; // eg: "RESTAURATION    AV Salon         (Maison) (10:52:06 17/Sep/21)"
const INACTIVE_PREFIX = 'RESTAURATION';
const dateParser = () => /(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\w{3})\/(\d{2})/g; // HH:mm:ss DD/MMM/YY
const DATE_INDEXES = { hour: 0, minute: 1, second: 2, day: 3, month: 4, year: 5 };
const MONTHS = buildMonths();

export function parse(msg: Message): ZoneUpdate[] {

  const rows = msg.body.content.match(MESSAGE_EXTRACTOR);
  if (!rows) {
    log.error(`(${msg.debugId}) : discarding message as it does not match the extractor rule`);
    return;
  }

  return rows
    .map((row) => parseRow(msg, row))
    .filter(zone => zone);
}

function parseRow(msg: Message, row: string): ZoneUpdate {
  try {

    const result = messageParser().exec(row);
    if (!result) {
      log.error(`(${msg.debugId}, row: '${row}') : discarding row as it does not match the parser rule`);
      return;
    }

    const parts = result.slice(1);

    const { zone, active } = parseZone(parts[0]);
    const date = parseDate(parts[2]);

    if (!date) {
      log.error(`(${msg.debugId}, row: '${row}') : Invalid date in message`);
      return;
    }

    return { zone, active, date };
  } catch (err) {
    log.error(err, `(${msg.debugId}, row: '${row}') : Error processing`);
  }
}

function buildMonths() {
  const list = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

  const months: { [value: string]: number; } = {};
  for (const [index, value] of list.entries()) {
    months[value] = index;
  }

  return months;
}

function parseZone(value: string) {
  value = value.trim();

  if (value.startsWith(INACTIVE_PREFIX)) {
    return {
      zone: value.substring(INACTIVE_PREFIX.length).trim(),
      active: false
    };
  } else {
    return { zone: value, active: true };
  }
}

function parseDate(value: string) {
  const result = dateParser().exec(value);
  if (!result) {
    return;
  }

  const parts = result.slice(1);
  if (parts.length !== 6) {
    return;
  }

  const year = parseInt(parts[DATE_INDEXES.year], 10) + 2000;
  const month = MONTHS[parts[DATE_INDEXES.month]];
  const day = parseInt(parts[DATE_INDEXES.day]);
  const hour = parseInt(parts[DATE_INDEXES.hour]);
  const minute = parseInt(parts[DATE_INDEXES.minute]);
  const second = parseInt(parts[DATE_INDEXES.second]);

  const date = new Date(year, month, day, hour, minute, second);
  if (isNaN(date.valueOf())) {
    return;
  }

  return date;
}