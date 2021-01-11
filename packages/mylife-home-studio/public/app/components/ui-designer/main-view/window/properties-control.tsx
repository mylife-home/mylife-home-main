import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useControlState } from './window-state';

const useStyles = makeStyles((theme) => ({
}));

const PropertiesControl: FunctionComponent<{ className?: string; id: string; }> = ({ className, id }) => {
  const classes = useStyles();
  const { control, update } = useControlState(id);

  return (
    <div className={className}>
      <div>toolbox control {control.id}</div>
      <div>TODO: duplicate control</div>
    </div>
  );
};

export default PropertiesControl;