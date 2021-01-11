import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getWindowsIds } from '../../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  component: {
    width: 300,
  },
}));

export interface WindowSelectorProps {
  nullable?: boolean;
  label?: string;
  value: string;
  onChange: (value: string) => void;
} 

const WindowSelector: FunctionComponent<WindowSelectorProps> = ({nullable = false,  label, value, onChange }) => {
  const classes= useStyles();
  const windowsIds = useTabSelector(getWindowsIds);
  
  return (
    <Autocomplete
      disableClearable={!nullable}
      options={windowsIds}
      className={classes.component}
      renderInput={(params) => <TextField {...params} label={label} variant="outlined" />}
      value={value}
      onChange={(event: any, newValue: string) => { onChange(newValue); }}
    />
  );
};

export default WindowSelector;