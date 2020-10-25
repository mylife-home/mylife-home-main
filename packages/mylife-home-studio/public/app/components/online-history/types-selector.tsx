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
    onChange(value.length === types.length ? null : value);
  };

  const valueSet = useMemo(() => value ? new Set(value) : typesSet, [value]);
  const selectValue = useMemo(() => Array.from(valueSet), [valueSet]);

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
        renderValue: () => (
          <div className={classes.chips}>
            {types.filter(type => valueSet.has(type)).map((type) => (
              <div key={type} className={classes.chip}>
                <Tooltip title={<TypeLabel type={type} />}>
                  <div>
                    <TypeIcon type={type} />
                  </div>
                </Tooltip>
              </div>
            ))}
          </div>
        )
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
