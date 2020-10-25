import React, { FunctionComponent, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
            
import { HistoryItemType } from '../../store/online-history/types';
import { TypeIcon, TypeLabel } from './types';

const types: HistoryItemType[] = ['instance-set', 'instance-clear', 'component-set', 'component-clear', 'state-set'];
const typesSet = new Set(types);

const useStyles = makeStyles((theme) => ({
  selector: {
    width: 150,
  },
  input: {
    height: '0.8rem'
  },
  chips: {
    display: 'flex',
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
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as HistoryItemType[];
    onChange(formatValue(value));
  };

  const valueSet = useMemo(() => value ? new Set(value) : typesSet, [value]);
  const selectValue = useMemo(() => value || [], [value]);

  return (
    <TextField
      select
      className={classes.selector}
      label='Types'
      value={selectValue}
      onChange={handleChange}
      inputProps={{ className: classes.input }}
      SelectProps={{
        multiple: true,
        renderValue: (value: HistoryItemType[]) => {
          if (value.length === 0) {
            return null;
          }

          return (
            <div className={classes.chips}>
              {(value).map((value) => (
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
          <Checkbox checked={valueSet.has(type)} color='primary'/>

          <ListItemIcon className={classes.menuIcon}>
            <TypeIcon type={type} />
          </ListItemIcon>
          
          <ListItemText primary={<TypeLabel type={type} />} />
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TypesSelector;

function formatValue(value: HistoryItemType[]) {
  if (value.length === 0 || value.length === types.length) {
    return null;
  }

  // preserve order
  const valueSet = new Set(value);
  return types.filter(type => valueSet.has(type));
}