import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getWindowsIds, getWindowsMap } from '../../../../store/ui-designer/selectors';
import { useComponentStyles } from '../../../lib/properties-layout';

export interface WindowSelectorProps {
  nullable?: boolean;
  value: string;
  onChange: (value: string) => void;
}

interface Item {
  id: string;
  label: string;
}

const WindowSelector: FunctionComponent<WindowSelectorProps> = ({ nullable = false, value, onChange }) => {
  const classes = useComponentStyles();
  const windowsIds = useTabSelector(getWindowsIds);
  const windowsMap = useSelector(getWindowsMap);
  const list = useMemo(() => windowsIds.map(id => ({ id, label: windowsMap[id].windowId })), [windowsIds, windowsMap]);

  return (
    <Autocomplete
      disableClearable={!nullable}
      options={list}
      getOptionLabel={item => item.label}
      className={classes.component}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
      value={value}
      onChange={(event, newValue) => {
        onChange((newValue as Item).id);
      }}
    />
  );
};

export default WindowSelector;
