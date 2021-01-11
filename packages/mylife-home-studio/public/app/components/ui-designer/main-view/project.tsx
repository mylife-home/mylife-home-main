import React, { FunctionComponent, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getDefaultWindow } from '../../../store/ui-designer/selectors';
import WindowSelector from './common/window-selector';
import ResourceSelector from './common/resource-selector';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'column',
  },
}));

const Project: FunctionComponent = () => {
  const classes = useStyles();
  const defaultWindow = useTabSelector(getDefaultWindow);

  const [w1, setw1] = useState<string>(null);
  const [w2, setw2] = useState<string>('desktop-ext');
  const [r, setr] = useState<string>('color-blue');
  
  return (
    <Container
      title={
        <Title text="Projet" icon={ProjectIcon} />
      }
    >
      <div className={classes.wrapper}>
        TODO
        {JSON.stringify(defaultWindow)}
        <WindowSelector value={w1} onChange={setw1} nullable />
        <WindowSelector value={w2} onChange={setw2} />
        <ResourceSelector value={r} onChange={setr} />
      </div>
    </Container>
  );
};

export default Project;
