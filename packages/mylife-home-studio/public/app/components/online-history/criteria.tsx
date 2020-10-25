import React, { FunctionComponent, useCallback } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Input from '@material-ui/core/Input';
            
import DebouncedTextField from '../lib/debounced-text-field';
import { CriteriaDefinition, HistoryItemType } from '../../store/online-history/types';
import { TypeIcon, TypeLabel } from './types';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'row',

    '& > *': {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
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
  level: {
    width: '12ch'
  }
}));

type SetCriteria = (updater: (prevState: CriteriaDefinition) => CriteriaDefinition) => void;

interface CriteriaProps {
  className?: string;
  criteria: CriteriaDefinition;
  setCriteria: SetCriteria;
}

const Criteria: FunctionComponent<CriteriaProps> = ({ className, criteria, setCriteria }) => {
  const classes = useStyles();

  const [types, setTypes] = useTypesValue(criteria, setCriteria);
  const [instance, setInstance] = useTextValue(criteria, setCriteria, 'instance');
  const [component, setComponent] = useTextValue(criteria, setCriteria, 'component');
  const [state, setState] = useTextValue(criteria, setCriteria, 'state');

  return (
    <div className={clsx(classes.container, className)}>
      <TypesSelector value={types} onChange={setTypes} />
      <DebouncedTextField label='Instance' className={classes.instance} value={instance} onChange={setInstance} />
      <DebouncedTextField label='Component' className={classes.name} value={component} onChange={setComponent} />
      <DebouncedTextField label='État' className={classes.name} value={state} onChange={setState} />
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

const types: HistoryItemType[] = ['instance-set', 'instance-clear', 'component-set', 'component-clear', 'state-set'];

function useTypesValue(criteria: CriteriaDefinition, setCriteria: SetCriteria): [HistoryItemType[], (newValue: HistoryItemType[]) => void] {
  const changeValue = useCallback((newValue: HistoryItemType[]) => {
    const newTypes = newValue.length === types.length ? null : newValue;
    setCriteria(prevState => ({ ...prevState, types: newTypes }));
  }, [setCriteria]);

  const value = criteria.types || types.slice();

  return [value, changeValue];
}

const useTypeSelectorStyles = makeStyles((theme) => ({
  selector: {
    width: 150,
  },
  input: {
    height: '0.8rem'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  menuIcon: {
    minWidth: 30
  }
}));

type OnChange = (value: HistoryItemType[]) => void;

const TypesSelector: FunctionComponent<{ value: HistoryItemType[]; onChange: OnChange; }> = ({ value, onChange }) => {
  const classes = useTypeSelectorStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as HistoryItemType[];
    onChange(value);
  };

  return (
    <TextField
      select
      className={classes.selector}
      label='Types'
      value={value}
      onChange={handleChange}
      inputProps={{ className: classes.input }}
      SelectProps={{
        multiple: true,
        renderValue: (selected: HistoryItemType[]) => {
          if(selected.length === types.length) {
            return null;
          }

          return (
            <div className={classes.chips}>
              {(selected).map((value) => (
                <div key={value} className={classes.chip}>
                  <Tooltip title={<TypeLabel type={value} />}>
                    <div>
                      <TypeIcon type={value} />
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          );
        }
      }}
    >
      {types.map((type) => (
        <MenuItem key={type} value={type}>
          <Checkbox checked={value.indexOf(type) > -1} color='primary'/>

          <ListItemIcon className={classes.menuIcon}>
            <TypeIcon type={type} />
          </ListItemIcon>
          
          <ListItemText primary={type} />
        </MenuItem>
      ))}
    </TextField>
  );
};
