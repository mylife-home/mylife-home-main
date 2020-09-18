import React, { FunctionComponent, useCallback, useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { addLogItems } from '../../store/online-logs-view/actions';
import { useActions } from '../lib/use-actions';
import DebouncedTextField from '../lib/debounced-text-field';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',

    '& > *': {
      margin: theme.spacing(1),
    },
  },
  name: {
    width: '50ch',
  },
  instance: {
    width: '25ch',
  },
  message: {
    width: '50ch',
  },
}));

const LevelSelector: FunctionComponent<{ min: number, max: number, set: (min: number, max: number) => void }> = ({ min, max, set }) => {

  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    console.log('click away');
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <>
      
        <Popper open={!!anchorEl} anchorEl={anchorEl}>
          <Paper>
            TODO
          </Paper>
        </Popper>

        <Button onClick={handleClick}>
          {`${min} - ${max}`}
        </Button>
      </>
    </ClickAwayListener>
  );
};

export interface CriteriaDefinition {
  name: string;
  instance: string;
  message: string;
  error: boolean;
  levelMin: number;
  levelMax: number;
}

type SetCriteria = (updater: (prevState: CriteriaDefinition) => CriteriaDefinition) => void;

interface CriteriaProps {
  className?: string;
  criteria: CriteriaDefinition;
  setCriteria: SetCriteria;
}

const Criteria: FunctionComponent<CriteriaProps> = ({ className, criteria, setCriteria }) => {
  const classes = useStyles();
  const insertTests = useTestLogsInsert();

  const [name, setName] = useTextValue(criteria, setCriteria, 'name');
  const [instance, setInstance] = useTextValue(criteria, setCriteria, 'instance');
  const [message, setMessage] = useTextValue(criteria, setCriteria, 'message');
  const [errorChecked, errorIndeterminate, changeError] = useCheckboxValue(criteria, setCriteria, 'error');
  const setLevel = useCallback((levelMin: number, levelMax: number) => setCriteria(prevState => ({ ...prevState, levelMin, levelMax })), [setCriteria]);

  return (
    <div className={clsx(classes.container, className)}>
      <Button onClick={insertTests}>Insert tests</Button>
      <DebouncedTextField label="Nom" className={classes.name} value={name} onChange={setName} />
      <DebouncedTextField label="Instance" className={classes.instance} value={instance} onChange={setInstance} />
      <DebouncedTextField label="Message" className={classes.message} value={message} onChange={setMessage} />
      <FormControlLabel label="Erreur" control={<Checkbox color='primary' checked={errorChecked} indeterminate={errorIndeterminate} onChange={changeError}/>} />
      <LevelSelector min={criteria.levelMin} max={criteria.levelMax} set={setLevel} />
    </div>
  );
};

export default Criteria;

function useTextValue(criteria: CriteriaDefinition, setCriteria: SetCriteria, key: keyof CriteriaDefinition): [string, (newValue: string) => void] {
  const changeValue = useCallback((newValue: string) => {
    setCriteria(prevState => ({ ...prevState, [key]: newValue || null }));
  }, [setCriteria, key]);

  const value = criteria[key] as string || '';

  return [value, changeValue];
}

function useCheckboxValue(criteria: CriteriaDefinition, setCriteria: SetCriteria, key: keyof CriteriaDefinition): [boolean, boolean, () => void] {
  const changeValue = useCallback(() => setCriteria(prevState => ({ ...prevState, [key]: getTriStateNext(prevState[key] as boolean) })), [setCriteria, key]);
  const value = criteria[key] as boolean;
  const checked = value === true;
  const indeterminate = value === null;
  return [checked, indeterminate, changeValue];
}

function getTriStateNext(value: boolean) {
  switch(value) {
    case null:
      return true;
    case true:
      return false;
    case false:
      return null;
  }
}

// name with wildcards
// instanceName
// msg contains
// !!err
// level min-max

let testIndex = 0;

const stack = `at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/gulp.config/webpack-build.ts:29:25
at finalCallback (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:354:32)
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:414:15
at Hook.eval [as callAsync] (eval at create (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:6:1)
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:411:23
at Compiler.emitRecords (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:699:39)
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:403:11
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:681:14
at Hook.eval [as callAsync] (eval at create (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:6:1)
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:678:27
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/neo-async/async.js:2818:7
at done (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/neo-async/async.js:3522:9)
at Hook.eval [as callAsync] (eval at create (/home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/node_modules/tapable/lib/HookCodeFactory.js:33:10), <anonymous>:6:1)
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/webpack/lib/Compiler.js:562:33
at /home/vincent/workspace/mylife-home-main/packages/mylife-home-packager/node_modules/graceful-fs/graceful-fs.js:136:16
at /home/vincent/.node_modules/lib/node_modules/gulp-cli/node_modules/graceful-fs/graceful-fs.js:61:14`;

function useConnect() {
  return useActions({ addLogItems });
}

function useTestLogsInsert() {
  const { addLogItems } = useConnect();

  return () => {
    addLogItems([
      { id: `test-${++testIndex}`, name: 'test:test', instanceName: 'test-instance', hostname: 'test-host', pid: 42, level: 3, msg: 'test level 3', time: new Date(), err: null },
      { id: `test-${++testIndex}`, name: 'test:test', instanceName: 'test-instance', hostname: 'test-host', pid: 42, level: 10, msg: 'test trace', time: new Date(), err: null },
      { id: `test-${++testIndex}`, name: 'test:test', instanceName: 'test-instance', hostname: 'test-host', pid: 42, level: 20, msg: 'test debug', time: new Date(), err: null },
      { id: `test-${++testIndex}`, name: 'test:test', instanceName: 'test-instance', hostname: 'test-host', pid: 42, level: 30, msg: 'test info', time: new Date(), err: null },
      { id: `test-${++testIndex}`, name: 'test:test', instanceName: 'test-instance', hostname: 'test-host', pid: 42, level: 40, msg: 'test warn', time: new Date(), err: null },
      {
        id: `test-${++testIndex}`,
        name: 'test:test',
        instanceName: 'test-instance',
        hostname: 'test-host',
        pid: 42,
        level: 50,
        msg: 'test error',
        time: new Date(),
        err: { message: 'test error', name: 'ErrorType', stack },
      },
      {
        id: `test-${++testIndex}`,
        name: 'test:test',
        instanceName: 'test-instance',
        hostname: 'test-host',
        pid: 42,
        level: 60,
        msg: 'test fatal',
        time: new Date(),
        err: { message: 'test fatal', name: 'ErrorType', stack },
      },
    ]);
  };
}
