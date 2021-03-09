import React, { FunctionComponent } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getWindowsIds } from '../../../../store/ui-designer/selectors';
import { useComponentStyles } from '../../../lib/properties-layout';

export interface WindowSelectorProps {
  nullable?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const WindowSelector: FunctionComponent<WindowSelectorProps> = ({ nullable = false, value, onChange }) => {
  const classes = useComponentStyles();
  const windowsIds = useTabSelector(getWindowsIds);

  return (
    <Autocomplete
      disableClearable={!nullable}
      options={windowsIds}
      className={classes.component}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      value={value}
      onChange={(event: any, newValue: string) => {
        onChange(newValue);
      }}
    />
  );
};

export default WindowSelector;
